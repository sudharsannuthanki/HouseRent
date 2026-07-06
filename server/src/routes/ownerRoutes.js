import express from "express";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Every route below belongs to a logged-in Owner
router.use(protect, authorize("owner"));

// Add a new property listing (images sent as multipart/form-data, field name "images")
router.post("/properties", upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, street, city, state, pincode, listingType, propertyType, price, bedrooms, bathrooms, area, amenities } = req.body;

    if (!title || !description || !street || !city || !state || !pincode || !listingType || !price) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const property = await Property.create({
      title,
      description,
      street,
      city,
      state,
      pincode,
      listingType,
      propertyType,
      price,
      bedrooms,
      bathrooms,
      area,
      amenities: amenities ? amenities.split(",").map((a) => a.trim()) : [],
      images,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not add property", error: error.message });
  }
});

// All properties belonging to the logged-in owner
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch properties" });
  }
});

// Single property belonging to the logged-in owner (used to prefill the edit form)
router.get("/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view your own properties" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch property" });
  }
});

// Update one of the owner's own properties
router.put("/properties/:id", upload.array("images", 6), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }

    const fields = ["title", "description", "street", "city", "state", "pincode", "listingType", "propertyType", "price", "bedrooms", "bathrooms", "area"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) property[field] = req.body[field];
    });

    // "removed" is reserved for the admin removal-request/consent flow below
    if (req.body.status && ["active", "inactive"].includes(req.body.status)) {
      property.status = req.body.status;
      if (req.body.status === "active" && property.removalRequest?.status === "approved") {
        property.removalRequest = { status: "none" };
      }
    }

    if (req.body.amenities) {
      property.amenities = req.body.amenities.split(",").map((a) => a.trim());
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      property.images = [...newImages, ...property.images];
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not update property", error: error.message });
  }
});

// Owner responds to an admin's request to take their listing down. The
// listing is only actually taken off the app if the owner consents.
router.post("/properties/:id/removal-response", async (req, res) => {
  try {
    const { consent } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only respond for your own properties" });
    }
    if (property.removalRequest?.status !== "pending") {
      return res.status(400).json({ message: "There is no pending removal request for this listing" });
    }

    property.removalRequest.status = consent ? "approved" : "declined";
    property.removalRequest.respondedAt = new Date();
    if (consent) {
      property.status = "removed";
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not respond to removal request", error: error.message });
  }
});

// Delete one of the owner's own properties
router.delete("/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own properties" });
    }

    await property.deleteOne();
    await Booking.deleteMany({ property: property._id });

    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete property" });
  }
});

// All booking requests made on the owner's properties
router.get("/bookings", async (req, res) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select("_id");
    const propertyIds = myProperties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate("property", "title city listingType price images")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch bookings" });
  }
});

// Approve or reject a booking request on the owner's property
router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const booking = await Booking.findById(req.params.id).populate("property");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only manage bookings on your own properties" });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Could not update booking" });
  }
});

export default router;
