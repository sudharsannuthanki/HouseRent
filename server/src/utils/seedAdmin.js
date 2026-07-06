// One-time script to create the first admin account (registration only allows Owner/Renter).
// Usage: node src/utils/seedAdmin.js "Admin Name" admin@houserent.com StrongPass123
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

async function run() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.log('Usage: node src/utils/seedAdmin.js "Admin Name" admin@email.com Password123');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("A user with this email already exists.");
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const hashedAnswer = await bcrypt.hash("admin-seed", salt);

  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "admin",
    securityQuestion: "Set by system seed script",
    securityAnswer: hashedAnswer,
  });

  console.log(`Admin account created for ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

run();
