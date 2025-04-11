import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  // Check for token in cookies (existing) or headers (for AdminDashboard)
  const token =
    req.cookies?.access_token || req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies?.refresh_token;

  if (!token) {
    return next(errorHandler(401, "Unauthorized: No access token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "-password -otp -resetPasswordOTP"
    );
    if (!user) return next(errorHandler(404, "User not found"));

    req.user = user; // Store full user object, including role
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" && refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(refreshDecoded.id);

        if (!user || user.refreshToken !== refreshToken) {
          return next(errorHandler(403, "Forbidden: Invalid refresh token"));
        }

        const newAccessToken = jwt.sign(
          { id: refreshDecoded.id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const newRefreshToken = jwt.sign(
          { id: refreshDecoded.id },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        req.user = user; // Store full user object
        next();
      } catch (refreshErr) {
        console.error("Refresh token error:", refreshErr);
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

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }
  next();
};
