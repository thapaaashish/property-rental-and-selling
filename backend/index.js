import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import adminRoutes from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listing.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import movingServicesRouter from "./routes/movingServices.route.js";
import bookingRouter from "./routes/booking.route.js";
import movingServiceRoutes from "./routes/movingServices.route.js";
import paymentRouter from "./routes/payment.route.js";
import crypto from "crypto";
import reviewRoutes from "./routes/review.route.js";

import { autoCancelExpiredBookings } from "./controllers/booking.controller.js";

import emailRouter from "./routes/email.routes.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error: " + err));

const app = express();

// Enable CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow frontend access
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/moving-services", movingServicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/email", emailRouter); // New route for sending emails from the property inquiry form
app.use("/api/moving-services", movingServiceRoutes);
app.use("/api/payment", paymentRouter); // route for payment processing
app.use("/api/reviews", reviewRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Backend Error:", err); // Log the actual error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Schedule auto-cancel of expired bookings (runs every hour)
cron.schedule("0 * * * *", async () => {
  console.log("Running auto-cancel expired bookings...");
  await autoCancelExpiredBookings();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
