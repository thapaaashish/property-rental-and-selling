import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";  // Use the updated User model
import dotenv from 'dotenv';

dotenv.config();

// Set up nodemailer transporter (Gmail configuration here, adjust as needed)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Ensure OTP is a string from the start
};

// Send OTP to email
const sendOTP = (email, otp) => {
    console.log("Sending OTP to:", email);  // Debug log
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification Code",
      text: `Your OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending OTP:", err);
      } else {
        console.log("OTP sent:", info.response);
      }
    });
};

// Signin
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Invalid Credentials"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// OTP Verification
export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  
  console.log("Incoming OTP request:", { email, otp });
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("Found user:", { 
      email: user.email,
      storedOTP: user.otp,
      otpExpires: user.otpExpires,
      currentTime: new Date()
    });

    // Check if OTP exists
    if (!user.otp) {
      console.log("No OTP found for user");
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP"
      });
    }

    // Convert both OTPs to strings for comparison
    const providedOTP = otp.toString();
    const storedOTP = user.otp.toString();
    
    console.log("Comparing OTPs:", {
      providedOTP,
      storedOTP,
      match: providedOTP === storedOTP
    });

    // Check if OTP matches
    if (providedOTP !== storedOTP) {
      console.log("OTP mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Check if OTP has expired
    if (user.otpExpires < Date.now()) {
      console.log("OTP expired:", {
        expiryTime: user.otpExpires,
        currentTime: Date.now()
      });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP"
      });
    }

    // OTP is valid, update user
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log("OTP verification successful for user:", email);

    return res.status(200).json({
      success: true,
      message: "Email successfully verified!"
    });
    
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification"
    });
  }
};

// Update signup endpoint to match response format
export const signup = async (req, res, next) => {
  const { fullname, username, email, password } = req.body;
  
  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ fullname, username, email, password: hashedPassword });
    
    // Generate and send OTP
    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    await newUser.save();
    sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message: "User created successfully! Please verify your email with the OTP."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating user"
    });
  }
};
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending reset OTP:", err);
        return res.status(500).json({
          success: false,
          message: "Error sending OTP"
        });
      }
      console.log("Reset OTP sent:", info.response);
    });

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred"
    });
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Hash new password
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    
    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred"
    });
  }
};
