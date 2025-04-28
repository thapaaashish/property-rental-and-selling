import Booking from "../models/booking.model.js";
import axios from "axios";
import { sendPaymentConfirmation } from "../utils/email.js";

const khalti = axios.create({
  baseURL: "https://a.khalti.com/api/v2/",
  headers: {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initiate payment
export const initiatePayment = async (req, res, next) => {
  try {
    console.log(req.body);
    const { bookingId } = req.body;
    const userId = req.user.id;
    console.log("User ID:", userId);

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("listing")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized - You can only pay for your own bookings",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be paid for",
        currentStatus: booking.status,
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This booking has already been paid",
        paymentStatus: booking.paymentStatus,
      });
    }

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      website_url: process.env.FRONTEND_URL,
      amount: booking.totalPrice * 100, // Convert to paisa
      purchase_order_id: `booking_${booking._id}_user_${userId}`,
      purchase_order_name: `Property: ${booking.listing?.title || "Unknown"}`,
      customer_info: {
        name: booking.user.fullname || "Customer",
        email: booking.user.email || "N/A",
        phone: booking.user.phone || "9800000000",
      },
    };

    console.log("Initiating payment with payload:", payload);
    const response = await khalti.post("epayment/initiate/", payload);
    console.log("Khalti initiation response:", response.data);

    // Save pidx to booking for future reference
    booking.pidx = response.data.pidx;
    await booking.save();

    res.status(200).json({
      success: true,
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    if (error.response) {
      console.error("Khalti API response error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
      khaltiError: error.response?.data,
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { pidx, purchaseOrderId } = req.body;
    const userId = req.user.id;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Payment ID (pidx) is required",
      });
    }

    console.log("Verifying payment with pidx:", pidx);

    // Step 1: Call Khalti Lookup API
    const response = await khalti.post("epayment/lookup/", { pidx });
    const paymentData = response.data;
    console.log("Khalti lookup response:", paymentData);

    if (paymentData.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentData.status}`,
        paymentDetails: paymentData,
      });
    }

    console.log("Received purchaseOrderId:", purchaseOrderId);

    const bookingIdMatch = purchaseOrderId.match(/^booking_([a-f\d]{24})/);
    if (!bookingIdMatch || !bookingIdMatch[1]) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase_order_id format. Booking ID not found.",
      });
    }

    const bookingId = bookingIdMatch[1];

    // Step 3: Find booking and validate
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You can only verify your own bookings",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    // Step 4: Update booking
    booking.paymentStatus = "paid";
    booking.paymentMethod = "khalti";
    booking.paymentDate = new Date();
    booking.pidx = pidx;

    await booking.save();
    console.log("Booking updated successfully:", booking._id);

    // Step 5: Send payment confirmation email
    if (booking.user.email) {
      try {
        await sendPaymentConfirmation(booking.user.email, booking);
        console.log("Confirmation email sent to:", booking.user.email);
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    } else {
      console.warn("User has no email:", booking.user._id);
    }

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      paymentDetails: paymentData,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    if (error.response) {
      return res.status(500).json({
        success: false,
        message: "Khalti verification failed",
        error: error.response.data,
      });
    }
    next(error);
  }
};
