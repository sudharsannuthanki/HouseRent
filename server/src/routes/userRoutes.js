import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// REGISTER: creates a Renter or Owner account (Admins are seeded separately)
// The same email can be used for both a Renter/Buyer account and an Owner
// account - they're kept as two separate accounts, each with its own
// password. What's blocked is registering the same email+role combo twice.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const desiredRole = role === "owner" ? "owner" : "user";

    const existingUser = await User.findOne({ email: email.toLowerCase(), role: desiredRole });
    if (existingUser) {
      const roleLabel = desiredRole === "owner" ? "Owner" : "Renter/Buyer";
      return res.status(409).json({ message: `A ${roleLabel} account with this email already exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: desiredRole,
      phone,
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email and role already exists" });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// LOGIN
// Because one email can now belong to up to two accounts (a "user" account
// and an "owner" account), we look up every account for that email and try
// the given password against each one. The password is effectively what
// tells the two accounts apart, so there's no separate "login as" picker.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidates = await User.find({ email: (email || "").toLowerCase() });

    let matchedUser = null;
    for (const candidate of candidates) {
      if (candidate.isActive && (await bcrypt.compare(password, candidate.password))) {
        matchedUser = candidate;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(matchedUser._id, matchedUser.role);
    res.json({ token, user: { id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// FORGOT PASSWORD - step 1: look up the security question for an email+role.
// The role is required here because the email alone may match two accounts.
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const { email, role } = req.body;
    const desiredRole = role === "owner" ? "owner" : "user";
    const user = await User.findOne({ email: (email || "").toLowerCase(), role: desiredRole });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email for that account type" });
    }
    res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// FORGOT PASSWORD - step 2: check the answer and set a new password
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, role, securityAnswer, newPassword } = req.body;
    const desiredRole = role === "owner" ? "owner" : "user";
    const user = await User.findOne({ email: (email || "").toLowerCase(), role: desiredRole });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email for that account type" });
    }

    const isCorrect = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!isCorrect) {
      return res.status(401).json({ message: "Security answer is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
});

// BROWSE properties - open to everyone, supports search/filter/sort
router.get("/properties", async (req, res) => {
  try {
    const { city, listingType, propertyType, search, minPrice, maxPrice, bedrooms, sort } = req.query;
    const filter = { status: "active" };

    if (city) filter.city = new RegExp(city, "i");
    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;

    if (search) {
      const term = new RegExp(search, "i");
      filter.$or = [{ title: term }, { city: term }, { state: term }, { description: term }];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };
    const sortOption = sortOptions[sort] || sortOptions.newest;

    const properties = await Property.find(filter).populate("owner", "name email phone").sort(sortOption);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch properties" });
  }
});

// Single property details
router.get("/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email phone");
    if (!property || property.status !== "active") {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch property" });
  }
});

// Renter/buyer sends a booking request - owner approves or rejects it later
router.post("/bookings", protect, async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const property = await Property.findById(propertyId);

    if (!property || property.status !== "active") {
      return res.status(404).json({ message: "Property not available" });
    }
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own property" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      type: property.listingType,
      message,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Could not create booking", error: error.message });
  }
});

// Renter's own booking history
router.get("/bookings/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("property").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch bookings" });
  }
});

// Renter cancels their own booking
router.patch("/bookings/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Could not cancel booking" });
  }
});

export default router;
