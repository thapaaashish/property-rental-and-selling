import express from "express";
import {signup, signin, verifyOTP, forgotPassword, resetPassword} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", (req, res, next) => {
    console.log("Incoming OTP request:", req.body); // Log request body
    next();
  }, verifyOTP);

export default router;