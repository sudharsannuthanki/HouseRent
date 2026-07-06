import express from "express";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Every chat route requires a logged-in user
router.use(protect);

// Makes sure the logged-in user is actually one of the two people allowed
// to see/use this booking's chat: the renter/buyer who sent it, or the
// owner of the property it was sent for.
async function loadBookingForChat(req, res) {
  const booking = await Booking.findById(req.params.bookingId).populate("property").populate("user", "name email role");

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return null;
  }

  const isRenter = booking.user._id.toString() === req.user._id.toString();
  const isOwner = booking.property.owner.toString() === req.user._id.toString();

  if (!isRenter && !isOwner) {
    res.status(403).json({ message: "You are not part of this conversation" });
    return null;
  }

  return booking;
}

// GET the conversation for a booking: booking/property context + all messages.
// Chat is available as soon as the booking is sent, regardless of its status.
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await loadBookingForChat(req, res);
    if (!booking) return;

    const messages = await Message.find({ booking: booking._id })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({
      booking: {
        _id: booking._id,
        status: booking.status,
        type: booking.type,
        property: {
          _id: booking.property._id,
          title: booking.property.title,
          city: booking.property.city,
          price: booking.property.price,
          listingType: booking.property.listingType,
          images: booking.property.images,
          owner: booking.property.owner,
        },
        renter: booking.user,
      },
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load conversation", error: error.message });
  }
});

// POST a new message into a booking's conversation
router.post("/:bookingId", async (req, res) => {
  try {
    const booking = await loadBookingForChat(req, res);
    if (!booking) return;

    const text = (req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const message = await Message.create({
      booking: booking._id,
      sender: req.user._id,
      text,
    });

    const populated = await message.populate("sender", "name role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Could not send message", error: error.message });
  }
});

export default router;
