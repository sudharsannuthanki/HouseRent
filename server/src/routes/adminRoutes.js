import express from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Every route below belongs to a logged-in Admin
router.use(protect, authorize("admin"));

// Quick numbers for the dashboard
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalOwners, totalProperties, totalBookings, pendingBookings] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      Property.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
    ]);
    res.json({ totalUsers, totalOwners, totalProperties, totalBookings, pendingBookings });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch stats" });
  }
});

// Every registered owner and renter (admins excluded)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password -securityAnswer").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch users" });
  }
});

// Activate/deactivate a user account
router.patch("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Could not update user" });
  }
});

// Every property listed on the platform
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email").sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch properties" });
  }
});

// Ask the owner for consent to take a listing down (e.g. a policy violation
// or a complaint). The listing stays live until the owner responds - admins
// cannot remove a listing unilaterally.
router.post("/properties/:id/request-removal", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please provide a reason for the removal request" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.status === "removed") {
      return res.status(400).json({ message: "This listing has already been removed" });
    }
    if (property.removalRequest?.status === "pending") {
      return res.status(400).json({ message: "A removal request is already pending owner consent" });
    }

    property.removalRequest = {
      status: "pending",
      requestedBy: req.user._id,
      reason: reason.trim(),
      requestedAt: new Date(),
      respondedAt: undefined,
    };
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not send removal request", error: error.message });
  }
});

// Every booking made on the platform
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("property", "title city listingType price")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch bookings" });
  }
});

export default router;
