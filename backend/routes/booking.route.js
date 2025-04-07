import express from "express";
import {
  createBooking,
  getUserBookings,
  confirmBooking,
  cancelBooking,
} from "../controllers/booking.controller.js";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/my-bookings", getUserBookings);
router.put("/confirm/:id", confirmBooking); // PUT /confirm/:id
router.put("/cancel/:id", cancelBooking); // PUT /cancel/:id

export default router;
