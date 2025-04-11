import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import bcryptjs from "bcryptjs";

// Get all users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(
      "-password -otp -resetPasswordOTP -refreshToken"
    );
    res.status(200).json(users);
  } catch (error) {
    next(errorHandler(500, "Error fetching users"));
  }
};

// Get all listings (Admin only)
export const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().populate("userRef", "fullname email");
    res.status(200).json(listings);
  } catch (error) {
    next(errorHandler(500, "Error fetching listings"));
  }
};

// Delete a listing (Admin only)
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting listing"));
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullname email")
      .populate("listing", "title");
    res.status(200).json(bookings);
  } catch (error) {
    next(errorHandler(500, "Error fetching bookings"));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting user"));
  }
};

// Create a new admin (Admin only)
export const createAdmin = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email already exists"));
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create new admin
    const newAdmin = new User({
      fullname,
      email,
      password: hashedPassword,
      role: "admin", // Force role to admin
      emailVerified: true, // Auto-verify for simplicity
    });

    await newAdmin.save();

    // Return the new admin without sensitive fields
    const { password: _, ...adminData } = newAdmin._doc;
    res.status(201).json(adminData);
  } catch (error) {
    next(errorHandler(500, "Error creating admin"));
  }
};
