import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.send("test route being called!!");
};

export const deleteUser = async (req, res, next) => {
  // Check if the authenticated user is trying to delete their own account
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Forbidden: Cannot delete another user"));
  }

  try {
    // Check if the user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    // Clear cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refresh_token", {
      // If you're using refresh tokens
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Log the deletion (optional)
    console.log(`User ${req.params.id} deleted by ${req.user.id}`);

    // Send success response
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    // Log the error (optional)
    console.error("Error deleting user:", error);

    // Pass the error to the error-handling middleware
    next(error);
  }
};

// Update User Profile
export const updateProfile = async (req, res, next) => {
  const { id } = req.params;
  const { fullname, email, phone, address, city, province, zipCode } = req.body;

  try {
    // Check if the user is updating their own profile
    if (req.user.id !== id) {
      return next(
        errorHandler(403, "Forbidden: You can only update your own profile")
      );
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.province = province || user.province;
    user.zipCode = zipCode || user.zipCode;

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user (excluding the password)
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Upload Profile Picture
export const uploadProfilePicture = async (req, res, next) => {
  const { imageUrl } = req.body;
  const { id } = req.user;

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Update the user's avatar
    user.avatar = imageUrl;
    await user.save();

    // Return the updated user (excluding the password)
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Get User Details
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc; // Exclude password from the response
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUserDetailsForPublic = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullname avatar bio role address city province zipCode createdAt"
    );
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
