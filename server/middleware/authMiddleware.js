import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_123");

      req.user = await User.findById(decoded.id).select("-password");

      // Check if user exists in database
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "User not found, please login again" });
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Token expired is expected behavior for refresh flow, suppress explicit error log
        return res
          .status(401)
          .json({ message: "Not authorized, token expired" });
      } else {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
