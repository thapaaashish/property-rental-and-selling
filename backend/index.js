import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";  // Import cors
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listing.route.js";


dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error: " + err));

const app = express();

// Enable CORS Middleware
app.use(cors({
  origin: "http://localhost:5173",  // Allow frontend access
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use('/backend/user', userRouter);
app.use('/backend/auth', authRouter);
app.use("/backend/listings", listingRouter);

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});