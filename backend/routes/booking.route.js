import express from "express";
import {
  createBooking,
  getUserBookings,
  confirmBooking,
  cancelBooking,
  checkBooking,
  editBooking,
  getAgentBookingRequests,
  getBookingsForListings,
} from "../controllers/booking.controller.js";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Rate limiter for booking creation (e.g., max 10 requests per 15 minutes)
const createBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many booking attempts from this IP, please try again later.",
});

router.post("/create-booking", createBookingLimiter, createBooking);
router.get("/my-bookings/:userId", getUserBookings);
router.put("/confirm/:id", confirmBooking);
router.put("/cancel/:id", cancelBooking);
router.post("/check-booking", checkBooking);
router.put("/edit/:id", editBooking);
router.get("/agent-requests/:userId", getAgentBookingRequests);
router.post("/for-listings", getBookingsForListings);

export default router;
