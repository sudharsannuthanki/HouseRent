import mongoose from "mongoose";

// Blueprint for a booking/purchase request made by a renter on a property.
// Every request starts as "pending" until the property owner approves or rejects it.
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    type: { type: String, enum: ["rent", "sale"], required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
