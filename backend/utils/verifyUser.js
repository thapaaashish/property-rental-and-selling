import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!token) {
    return next(errorHandler(401, "Unauthorized: No access token provided"));
  }

  try {
    // Verify the access token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" && refreshToken) {
      try {
        // Verify the refresh token
        const refreshUser = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Check if refresh token is valid in the database
        const user = await User.findById(refreshUser.id);
        if (!user || user.refreshToken !== refreshToken) {
          return next(errorHandler(403, "Forbidden: Invalid refresh token"));
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
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        req.user = refreshUser;
        next();
      } catch (err) {
        console.error("Refresh token error:", err);
        return next(
          errorHandler(403, "Forbidden: Invalid or expired refresh token")
        );
      }
    } else {
      console.error("Access token error:", err);
      return next(
        errorHandler(403, "Forbidden: Invalid or expired access token")
      );
    }
  }
};
