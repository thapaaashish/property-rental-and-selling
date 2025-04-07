import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";
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
    console.log("Received request body:", req.body);

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

    const listingExists = await Listing.findById(listing);
    if (!listingExists) {
      return res.status(404).json({ message: "Listing not found" });
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
    console.log("Booking created:", booking);
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error in createBooking:", error.message);
    next(error);
  }
};

// Get all bookings for the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// Confirm a booking (only if not already confirmed/cancelled)
export const confirmBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking is already confirmed." });
    }

    booking.status = "confirmed";
    await booking.save();

    // Optional: Mark listing as booked
    // await Listing.findByIdAndUpdate(booking.listing._id, { isBooked: true });

    res.status(200).json({ message: "Booking confirmed.", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to confirm booking", error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    booking.status = "cancelled";
    await booking.save();

    // Optional: Update listing
    // await Listing.findByIdAndUpdate(booking.listing._id, { isBooked: false });

    res.status(200).json({ message: "Booking cancelled.", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to cancel booking", error: err.message });
  }
};

// Can be run on a schedule using a cron job or node-cron
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

    console.log(`Auto-cancelled ${expired.modifiedCount} expired bookings.`);
  } catch (err) {
    console.error("Error auto-cancelling bookings:", err.message);
  }
};
