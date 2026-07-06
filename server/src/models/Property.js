import mongoose from "mongoose";

// Blueprint for a property listing, either for rent or for sale.
const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    listingType: { type: String, enum: ["rent", "sale"], required: true },
    // Common Indian property categories
    propertyType: {
      type: String,
      enum: ["Apartment", "Independent House", "Villa", "Studio", "Plot", "Commercial"],
      default: "Apartment",
    },
    price: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, min: 0 }, // in sq. ft.
    amenities: [{ type: String }],
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // "removed" = taken down after the owner consented to an admin's removal request
    status: { type: String, enum: ["active", "inactive", "removed"], default: "active" },
    // Tracks an admin's request to take this listing down. The listing is only
    // actually removed once the owner consents (see removal-response route).
    removalRequest: {
      status: { type: String, enum: ["none", "pending", "approved", "declined"], default: "none" },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, trim: true },
      requestedAt: { type: Date },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;
