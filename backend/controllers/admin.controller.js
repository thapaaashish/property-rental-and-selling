import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import bcryptjs from "bcryptjs";
import {
  sendUserBanNotification,
  sendPropertyLockNotification,
} from "../utils/email.js";

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

// to get banned users
export const getBannedUsers = async (req, res, next) => {
  try {
    const bannedUsers = await User.find({
      "banStatus.isBanned": true,
    }).select("-password -refreshToken");

    res.status(200).json(bannedUsers);
  } catch (error) {
    next(errorHandler(500, "Error fetching banned users"));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      userId: user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings > 0) {
      return next(
        errorHandler(400, "Cannot delete user: they have active bookings")
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting user"));
  }
};

export const createAdmin = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email already exists"));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newAdmin = new User({
      fullname,
      email,
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      banStatus: {
        isBanned: false,
        reason: null,
        bannedAt: null,
        bannedBy: null,
      },
    });

    await newAdmin.save();

    const { password: _, ...adminData } = newAdmin._doc;
    res.status(201).json(adminData);
  } catch (error) {
    next(errorHandler(500, "Error creating admin"));
  }
};

// In your admin controller file

export const updateUserBanStatus = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  const { isBanned, reason } = req.body;

  if (typeof isBanned !== "boolean") {
    return next(errorHandler(400, "Invalid ban status. Must be true or false"));
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (user._id.toString() === req.user.id) {
      return next(errorHandler(400, "Cannot ban/unban your own account"));
    }

    if (user.role === "admin") {
      return next(errorHandler(400, "Cannot ban/unban other admins"));
    }

    if (isBanned === true) {
      const activeBookings = await Booking.countDocuments({
        userId: user._id,
        status: { $in: ["pending", "confirmed"] },
      });
      if (activeBookings > 0) {
        return next(
          errorHandler(400, "Cannot ban user: they have active bookings")
        );
      }

      user.banStatus = {
        isBanned: true,
        reason: reason || "Violation of terms of service",
        bannedAt: new Date(),
        bannedBy: req.user.id,
      };
    } else {
      user.banStatus = {
        isBanned: false,
        reason: null,
        bannedAt: null,
        bannedBy: null,
      };
    }

    await user.save();

    // Send notifications
    try {
      const adminUser = await User.findById(req.user.id);
      await sendUserBanNotification(user, adminUser, isBanned, reason);
    } catch (emailError) {
      console.error("Failed to send ban notification:", emailError);
      // Don't fail the request just because email failed
    }

    res.status(200).json({
      message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        banStatus: user.banStatus,
      },
    });
  } catch (error) {
    console.error("Error in updateUserBanStatus:", error);
    next(errorHandler(500, "Error updating ban status"));
  }
};

// Update lock status of a property (Admin only)
export const updateLockStatus = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  const { adminLockedStatus, reason } = req.body;

  if (typeof adminLockedStatus !== "boolean") {
    return next(
      errorHandler(400, "Invalid lock status. Must be true or false")
    );
  }

  if (adminLockedStatus === true && !reason?.trim()) {
    return next(
      errorHandler(400, "Reason is required when locking a property")
    );
  }

  try {
    const listing = await Listing.findById(req.params.id).populate(
      "userRef",
      "fullname email"
    );
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (adminLockedStatus === true) {
      const activeBookings = await Booking.countDocuments({
        listingId: listing._id,
        status: { $in: ["pending", "confirmed"] },
      });
      if (activeBookings > 0) {
        return next(
          errorHandler(400, "Cannot lock listing: it has active bookings")
        );
      }

      if (listing.status === "rented") {
        return next(
          errorHandler(400, "Cannot lock listing: it is currently rented")
        );
      }
    }

    listing.adminLockedStatus = adminLockedStatus;
    if (adminLockedStatus === true) {
      listing.status = "inactive";
      listing.lockReason = reason; // Store the lock reason
    } else {
      listing.lockReason = null; // Clear reason when unlocking
    }
    await listing.save();

    // Send notifications
    try {
      const adminUser = await User.findById(req.user._id);
      await sendPropertyLockNotification(
        listing,
        adminUser,
        adminLockedStatus,
        reason
      );
    } catch (emailError) {
      console.error("Failed to send lock notification:", emailError);
      // Don't fail the request just because email failed
    }

    res.status(200).json({
      message: `Listing ${
        adminLockedStatus ? "locked" : "unlocked"
      } successfully`,
      listing,
    });
  } catch (error) {
    console.error("Error in updateLockStatus:", error);
    next(errorHandler(500, "Error updating lock status"));
  }
};
