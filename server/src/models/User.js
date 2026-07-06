import mongoose from "mongoose";

// Blueprint for a registered account. role decides what the person can do:
// "admin" oversees everything, "owner" lists properties, "user" rents/buys.
//
// NOTE ON EMAIL: the same email address is allowed to have BOTH a "user"
// (renter/buyer) account and an "owner" account - they are treated as two
// completely separate accounts with their own password. What's not allowed
// is two accounts with the same email AND the same role (see the compound
// index below), so "email" alone is no longer unique.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "owner", "user"], default: "user" },
    phone: { type: String, trim: true },
    // Used for the in-app "forgot password" flow (no email sending needed)
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One account per email+role combination (e.g. one "user" account and one
// "owner" account can share an email, but two "owner" accounts cannot).
userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
