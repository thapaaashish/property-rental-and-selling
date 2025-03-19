import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";

dotenv.config();

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
  return crypto.randomInt(100000, 999999).toString(); // Ensure OTP is a string from the start
};

// Send OTP to email
const sendOTP = (email, otp) => {
  console.log("Sending OTP to:", email); // Debug log
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

// Signin for both User and Admin
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user =
      (await User.findOne({ email })) || (await Admin.findOne({ email }));
    if (!user) return next(errorHandler(404, "User not found"));

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) return next(errorHandler(401, "Invalid credentials"));

    const isAdmin = user instanceof Admin;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Log to verify token creation
    console.log("Generated admin_access_token:", token);

    res
      .cookie(isAdmin ? "admin_access_token" : "access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .status(200)
      .json({
        ...user.toObject(),
        password: undefined,
        accountType: isAdmin ? "admin" : "user",
      });
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
        message: "User not found",
      });
    }

    console.log("Found user:", {
      email: user.email,
      storedOTP: user.otp,
      otpExpires: user.otpExpires,
      currentTime: new Date(),
    });

    // Check if OTP exists
    if (!user.otp) {
      console.log("No OTP found for user");
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP",
      });
    }

    // Convert both OTPs to strings for comparison
    const providedOTP = otp.toString();
    const storedOTP = user.otp.toString();

    console.log("Comparing OTPs:", {
      providedOTP,
      storedOTP,
      match: providedOTP === storedOTP,
    });

    // Check if OTP matches
    if (providedOTP !== storedOTP) {
      console.log("OTP mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP has expired
    if (user.otpExpires < Date.now()) {
      console.log("OTP expired:", {
        expiryTime: user.otpExpires,
        currentTime: Date.now(),
      });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
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
      message: "Email successfully verified!",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
    });
  }
};

export const signup = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ fullname, email, password: hashedPassword });

    // Generate and send OTP
    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await newUser.save();
    sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message:
        "User created successfully! Please verify your email with the OTP.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating user",
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
        message: "User not found",
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
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending reset OTP:", err);
        return res.status(500).json({
          success: false,
          message: "Error sending OTP",
        });
      }
      console.log("Reset OTP sent:", info.response);
    });

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

export const google = async (req, res, next) => {
  try {
    const { name, email, photo } = req.body;

    if (!name || !email || !photo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (name, email, photo)",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        fullname: name,
        email: email,
        password: hashedPassword,
        avatar: photo,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during Google OAuth",
    });
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Get user ID from the token if available
    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Clear refreshToken in the database
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {
        // Token might be invalid, but we still want to clear cookies
        console.error("Error clearing refresh token:", err);
      }
    }

    // Clear cookies regardless of token validity
    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .status(200)
      .json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.cookies.access_token;

  // Input validation
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
    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify the current password
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

    // Hash the new password
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Clear the access_token cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error.message); // Avoid logging sensitive data

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

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return next(errorHandler(401, "No refresh token provided"));
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find the user and check if the refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Set the new access token in a cookie
    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
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
