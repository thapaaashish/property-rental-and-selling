import express from "express";
import {
  signup,
  signin,
  verifyOTP,
  forgotPassword,
  resetPassword,
  google,
  signOut,
  changePassword,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Signup, Signin, Google login, and other routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/signout", signOut);
router.get("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.put("/change-password", verifyToken, changePassword);
router.post("/reset-password", resetPassword);
router.post(
  "/verify-otp",
  (req, res, next) => {
    console.log("Incoming OTP request:", req.body); // Log request body
    next();
  },
  verifyOTP
);

export default router;
