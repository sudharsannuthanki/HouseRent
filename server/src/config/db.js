import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from .env");
    }

    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    console.error("========== FULL ERROR ==========");
    console.error(error);
    console.error("================================");
    process.exit(1);
  }
}
