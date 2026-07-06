import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Load environment variables from the server/.env file into process.env
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8000;

// MIDDLEWARE: allow the client (on a different port) to call this API
app.use(cors());

// MIDDLEWARE: let Express read JSON request bodies
app.use(express.json());

// Serve uploaded property images at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API status route
app.get("/", (req, res) => {
  res.json({ message: "HouseRent API is running" });
});

// ROUTING: mount each role's routes under its own path prefix
app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Database-first boot: connect to MongoDB, then start listening for requests
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
