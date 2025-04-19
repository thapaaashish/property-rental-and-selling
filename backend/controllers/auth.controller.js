import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Temporary User Schema with TTL
const tempUserSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  otp: String,
  otpExpires: Number,
  role: { type: String, default: "user" },
  createdAt: { type: Date, expires: 300, default: Date.now }, // Expires in 5 minutes
});
const TempUser = mongoose.model("TempUser", tempUserSchema);

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP as string
};

// Send OTP to email (async)
const sendOTP = async (email, otp) => {
  console.log("Sending OTP to:", email);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent:", info.response);
    return info;
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Failed to send OTP");
  }
};

// Signup: Store data temporarily in MongoDB TempUser and send OTP
export const signup = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if email already exists in permanent storage
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if email exists in temporary storage
    const existingTempUser = await TempUser.findOne({ email });
    if (existingTempUser) {
      console.log("Email already in temporary storage:", email);
      await TempUser.deleteOne({ email }); // Clean up stale temp data
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store data temporarily in MongoDB TempUser
    const tempUser = new TempUser({
      fullname,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      role: "user", // Added for consistency
    });
    await tempUser.save();
    console.log("Stored temporary data in TempUser for:", email);

    // Send OTP
    await sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete signup.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing signup",
    });
  }
};

// Verify OTP: Validate OTP and create user in MongoDB User collection
export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  console.log("Incoming OTP request:", { email, otp });

  try {
    // Retrieve temporary data from TempUser
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      console.log("No temporary data found for email:", email);
      return res.status(404).json({
        success: false,
        message: "OTP expired or email not found. Please sign up again.",
      });
    }

    console.log("Retrieved temporary data:", {
      email: tempUser.email,
      storedOTP: tempUser.otp,
      otpExpires: tempUser.otpExpires,
      currentTime: Date.now(),
    });

    // Convert both OTPs to strings for comparison
    const providedOTP = otp.toString();
    const storedOTP = tempUser.otp.toString();

    console.log("Comparing OTPs:", {
      providedOTP,
      storedOTP,
      match: providedOTP === storedOTP,
    });

    // Check if OTP matches
    if (providedOTP !== storedOTP) {
      console.log("OTP mismatch");
      await TempUser.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP has expired
    if (tempUser.otpExpires < Date.now()) {
      console.log("OTP expired:", {
        expiryTime: tempUser.otpExpires,
        currentTime: Date.now(),
      });
      await TempUser.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // OTP is valid, create user in MongoDB
    const newUser = new User({
      fullname: tempUser.fullname,
      email: tempUser.email,
      password: tempUser.password,
      emailVerified: true,
      role: tempUser.role, // Use role from tempUser
    });
    await newUser.save();
    console.log("User created in MongoDB:", tempUser.email);

    // Delete temporary data
    await TempUser.deleteOne({ email });
    console.log("Deleted temporary data for:", email);

    return res.status(200).json({
      success: true,
      message: "Email successfully verified! Account created.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    await TempUser.deleteOne({ email }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
    });
  }
};

// Signin for both User and Admin
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email and explicitly check banStatus
    const user = await User.findOne({ email }).select("+password +banStatus");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if user is banned - more robust check
    if (user.banStatus.isBanned === true) {
      const banDetails = user.banStatus;
      const banMessage = `Your account has been banned${
        banDetails.reason ? ` for: ${banDetails.reason}` : ""
      }.`;

      return res.status(403).json({
        success: false,
        error: "Account Banned",
        message: banMessage,
        details: {
          reason: banDetails.reason || "Not specified",
          bannedAt: banDetails.bannedAt
            ? new Date(banDetails.bannedAt).toLocaleString()
            : "Unknown",
          bannedBy: banDetails.bannedBy || "Administrator",
        },
        contactSupport:
          "If you believe this is a mistake, please contact support.",
      });
    }

    // Verify password
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      role: user.role || "user",
      email: user.email,
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare user data to return (excluding sensitive fields)
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.otp;
    delete userData.resetPasswordOTP;

    // Set cookies and send response
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .status(200)
      .json({
        success: true,
        message: "Signin successful",
        user: userData,
        token: accessToken,
      });
    console.log("Signin successful for user:", user.banStatus.isBanned);
  } catch (error) {
    console.error("Signin error:", error);
    next(errorHandler(500, "Signin failed. Please try again."));
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP email
    await sendOTP(email, otp); // Updated to use async sendOTP

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
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
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// Google OAuth
export const google = async (req, res, next) => {
  try {
    const { name, email, photo } = req.body;

    if (!name || !email || !photo) {
      return next(
        errorHandler(400, "Missing required fields (name, email, photo)")
      );
    }

    let user = await User.findOne({ email });
    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      user = new User({
        fullname: name,
        email,
        password: hashedPassword,
        avatar: photo,
        role: "user",
        emailVerified: true, // Google users are verified
      });
      await user.save();
    }

    const tokenPayload = { id: user._id, role: user.role };
    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.refreshToken = refreshToken;
    await user.save();

    const { password: pass, ...userData } = user._doc;
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        token: accessToken,
        refreshToken,
        ...userData,
      });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    next(errorHandler(500, "Google sign-in failed"));
  }
};

// Sign Out
export const signOut = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {
        console.error("Error clearing refresh token:", err);
      }
    }

    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .status(200)
      .json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.cookies.access_token;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long",
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = bcryptjs.compareSync(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token has expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while changing the password",
    });
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return next(errorHandler(401, "No refresh token provided"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Access token refreshed" });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(errorHandler(403, "Invalid or expired refresh token"));
    }
    next(error);
  }
};
