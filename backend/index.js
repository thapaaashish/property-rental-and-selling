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
import reviewRoutes from "./routes/review.route.js";
import kycRouter from "./routes/kyc.route.js";
import emailRouter from "./routes/email.routes.js";
import chatRouter from "./routes/chat.route.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/message.model.js";
import { autoCancelExpiredBookings } from "./controllers/booking.controller.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Enable CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/moving-services", movingServicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/email", emailRouter);
app.use("/api/moving-services", movingServiceRoutes);
app.use("/api/payment", paymentRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/kyc", kycRouter);
app.use("/api/chat", chatRouter);

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.error("No userId provided in socket connection");
    return;
  }
  socket.join(userId);

  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} (userId: ${userId}) joined room: ${roomId}`);

    try {
      // Mark messages as read for the user in this room
      await Message.updateMany(
        { roomId, receiverId: userId, read: false },
        { $set: { read: true } }
      );
      console.log(
        `Messages marked as read for user ${userId} in room ${roomId}`
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("sendMessage", (message) => {
    console.log("Received sendMessage:", message); // Debug
    if (
      !message.roomId ||
      !message.senderId ||
      !message.receiverId ||
      !message.content
    ) {
      console.error("Invalid message data:", message);
      return;
    }
    // Delay emission to avoid immediate updates during refresh
    setTimeout(() => {
      io.to(message.roomId).emit("message", message);
    }, 500);
  });

  socket.on("deleteMessage", ({ roomId, messageId }) => {
    console.log("Received deleteMessage:", { roomId, messageId }); // Debug
    if (!roomId || !messageId) {
      console.error("Invalid deleteMessage data:", { roomId, messageId });
      return;
    }
    io.to(roomId).emit("deleteMessage", { messageId });
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Cron job
cron.schedule("0 * * * *", async () => {
  console.log("Running auto-cancel expired bookings...");
  await autoCancelExpiredBookings();
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
