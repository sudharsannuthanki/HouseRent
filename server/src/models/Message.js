import mongoose from "mongoose";

// A single chat message tied to a booking. Once a booking is sent, both the
// renter/buyer who sent it and the owner of the property can message each
// other here - it works like a small thread attached to that booking.
const messageSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ booking: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
