import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { sendBookingConfirmation, notifyAgent } from "../utils/email.js";

export const createBooking = async (req, res, next) => {
  try {
    const {
      user,
      listing,
      bookingType,
      startDate,
      endDate,
      durationDays,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!listing) {
      return res.status(400).json({ message: "Listing ID is required" });
    }
    if (!totalPrice) {
      return res.status(400).json({ message: "Total price is required" });
    }
    if (bookingType === "Rent" && (!startDate || !endDate || !durationDays)) {
      return res.status(400).json({
        message: "Start date, end date, and duration are required for Rent",
      });
    }

    // Get listing and user details
    const listingExists = await Listing.findById(listing);
    const userExists = await User.findById(user);
    const ownerExists = await User.findById(listingExists.userRef); // Get owner using userRef

    if (!listingExists) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!ownerExists) {
      return res.status(404).json({ message: "Listing owner not found" });
    }

    // Check for existing bookings
    const existingBooking = await Booking.findOne({
      user,
      listing,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existingBooking) {
      return res.status(400).json({
        message: "You already have an active booking for this property",
      });
    }

    const booking = new Booking({
      user,
      listing,
      bookingType,
      startDate,
      endDate,
      durationDays,
      totalPrice,
    });

    await booking.save();

    // Send emails
    if (!userExists.email) {
      console.warn("User email missing - cannot send confirmation");
    } else {
      await sendBookingConfirmation(userExists.email, {
        ...booking.toObject(),
        listing: listingExists,
        user: userExists,
      });
    }

    if (!ownerExists.email) {
      console.warn("Owner email missing - cannot send notification");
    } else {
      await notifyAgent(ownerExists.email, {
        ...booking.toObject(),
        listing: listingExists,
        user: userExists,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error in createBooking:", error.message);
    next(error);
  }
};

export const checkBooking = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      return res
        .status(400)
        .json({ message: "User ID and Property ID are required" });
    }

    const existingBooking = await Booking.findOne({
      user: userId,
      listing: propertyId,
      status: { $in: ["pending", "confirmed"] },
    });

    res.status(200).json({ exists: !!existingBooking });
  } catch (error) {
    console.error("Error in checkBooking:", error.message);
    res.status(500).json({
      message: "Failed to check booking status",
      error: error.message,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const bookings = await Booking.find({ user: userId })
      .populate("listing")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};

export const autoCancelExpiredBookings = async () => {
  try {
    const now = new Date();

    const expired = await Booking.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: now },
      },
      { $set: { status: "cancelled" } }
    );

    console.log(`Auto-cancelled ${expired.modifiedCount} expired bookings`);
  } catch (err) {
    console.error("Error auto-cancelling bookings:", err.message);
  }
};

export const editBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { startDate, endDate, durationDays, totalPrice, userId } = req.body;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be edited" });
    }
    if (booking.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own bookings" });
    }

    if (booking.bookingType === "Rent") {
      if (!startDate || !endDate || !durationDays || !totalPrice) {
        return res.status(400).json({
          message:
            "Start date, end date, duration, and total price are required",
        });
      }
      booking.startDate = startDate;
      booking.endDate = endDate;
      booking.durationDays = durationDays;
      booking.totalPrice = totalPrice;
    } else if (totalPrice) {
      booking.totalPrice = totalPrice;
    }

    await booking.save();

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to edit booking", error: err.message });
  }
};

// Get bookings for a user's listings
export const getAgentBookingRequests = async (req, res) => {
  try {
    const agentId = req.params.userId;

    // Find all listings owned by this agent
    const agentListings = await Listing.find({ userRef: agentId });
    const listingIds = agentListings.map((listing) => listing._id);

    // Find all pending bookings for these listings with populated user data
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      status: "pending",
    })
      .populate({
        path: "listing",
        select: "title price bedrooms bathrooms imageUrls",
      })
      .populate({
        path: "user",
        select: "fullname email avatar phone address city province zipCode", // Include all needed fields
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch booking requests",
      error: err.message,
    });
  }
};

// confirmBooking to check ownership
// Confirm Booking
export const confirmBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { userId } = req.body; // Get userId from request body

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the requesting user owns the listing
    if (booking.listing.userRef.toString() !== userId) {
      return res.status(403).json({
        message: "You can only confirm bookings for your own listings",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking is already confirmed" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to confirm booking", error: err.message });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { userId } = req.body; // Get userId from request body

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the requesting user is either the booker or listing owner
    const isBooker = booking.user.toString() === userId;
    const isListingOwner = booking.listing.userRef.toString() === userId;

    if (!isBooker && !isListingOwner) {
      return res.status(403).json({
        message:
          "You can only cancel your own bookings or bookings for your listings",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to cancel booking", error: err.message });
  }
};

export const getBookingsForListings = async (req, res) => {
  try {
    const { listingIds } = req.body;
    
    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ message: "Valid listing IDs array is required" });
    }

    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate({
        path: "listing",
        select: "title price bedrooms bathrooms imageUrls type"
      })
      .populate({
        path: "user",
        select: "fullname email avatar phone"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch bookings for listings",
      error: err.message
    });
  }
};