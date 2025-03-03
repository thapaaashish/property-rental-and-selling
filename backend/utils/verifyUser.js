import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/user.model.js"; // Assuming you have a User model for DB operations

// Middleware to verify the access token and refresh it if expired
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token; // Get the refresh token from cookies

  if (!token) return next(errorHandler(401, "Unauthorized"));

  try {
    // Verify the access token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // Attach the decoded user to the request object
    next(); // Proceed with the request
  } catch (err) {
    if (err.name === "TokenExpiredError" && refreshToken) {
      // If access token is expired and refresh token exists
      try {
        // Verify the refresh token
        const refreshUser = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Check if refresh token is valid (optionally, verify against the DB if you store refresh tokens)
        const user = await User.findById(refreshUser.id);
        if (!user || user.refreshToken !== refreshToken) {
          return next(errorHandler(403, "Forbidden"));
        }

        // Issue a new access token
        const newAccessToken = jwt.sign(
          { id: refreshUser.id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        // Send the new access token as a response
        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Set to true in production
        });

        req.user = refreshUser; // Attach the refresh user to the request object
        next(); // Proceed with the request
      } catch (err) {
        return next(errorHandler(403, "Forbidden"));
      }
    } else {
      return next(errorHandler(403, "Forbidden"));
    }
  }
};
