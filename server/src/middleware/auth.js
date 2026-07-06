import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Checks the JWT sent by the browser and attaches the logged-in user to req.user
export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -securityAnswer");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Restricts a route to specific roles, e.g. authorize("admin")
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to do this" });
    }
    next();
  };
}
