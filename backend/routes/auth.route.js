import express from "express";
import { signup, signin, verifyOTP, forgotPassword, resetPassword, google, signOut, changePassword } from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Signup, Signin, Google login, and other routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signOut);
router.post("/forgot-password", forgotPassword);
router.put("/change-password", verifyToken, changePassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", (req, res, next) => {
  console.log("Incoming OTP request:", req.body); // Log request body
  next();
}, verifyOTP);

// Refresh Token Route
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Issue a new access token
    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Send the new access token as a response in cookies
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
    });

    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;
