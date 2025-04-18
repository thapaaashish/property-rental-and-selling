import Review from "../models/review.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import { errorHandler } from "../utils/error.js";

export const createReview = async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const userId = req.user.id;
    const fullname =
      req.user.fullname || req.user.email?.split("@")[0] || "Anonymous";
    const avatar = req.user.avatar || null;

    // Validate inputs
    if (!propertyId || !rating) {
      return next(errorHandler(400, "Property ID and rating are required"));
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return next(
        errorHandler(400, "Rating must be an integer between 1 and 5")
      );
    }

    // Verify property exists
    const listing = await Listing.findById(propertyId);
    if (!listing) {
      return next(errorHandler(404, "Property not found"));
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check for a valid booking
    const booking = await Booking.findOne({
      listing: propertyId,
      user: userId,
      status: "confirmed",
      paymentStatus: "paid",
      $or: [
        { bookingType: "Sale" },
        {
          bookingType: "Rent",
          endDate: { $lt: new Date() },
          startDate: { $ne: null },
          endDate: { $ne: null },
        },
      ],
    });

    if (!booking) {
      return next(
        errorHandler(403, "Only users who have stayed or purchased can review")
      );
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({ propertyId, userId });
    if (existingReview) {
      return next(errorHandler(400, "You have already reviewed this property"));
    }

    // Create review
    const review = await Review.create({
      propertyId,
      userId,
      fullname,
      avatar,
      rating,
      comment: comment || "",
    });

    return res.status(201).json({ review });
  } catch (error) {
    next(errorHandler(500, "An unexpected error occurred"));
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Verify property exists
    const listing = await Listing.findById(propertyId);
    if (!listing) {
      return next(errorHandler(404, "Property not found"));
    }

    // Fetch reviews
    const reviews = await Review.find({ propertyId }).sort({ createdAt: -1 });
    return res.status(200).json({ reviews });
  } catch (error) {
    next(errorHandler(500, "An unexpected error occurred"));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(errorHandler(404, "Review not found"));
    }

    // Verify user owns the review
    if (review.userId.toString() !== userId) {
      return next(
        errorHandler(403, "You are not authorized to delete this review")
      );
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "An unexpected error occurred"));
  }
};
