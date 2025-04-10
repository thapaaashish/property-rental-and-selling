import nodemailer from "nodemailer";
import Notification from "../models/notification.model.js";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const templates = {
  otp: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verification Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `,

  bookingConfirmation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation #${booking._id}</h2>
      <p>Thank you for your booking! Here are your details:</p>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0;">${booking.listing?.title || "Property"}</h3>
        <p><strong>Status:</strong> ${booking.status}</p>
        
        ${
          booking.bookingType === "Rent"
            ? `
          <p><strong>Dates:</strong> ${new Date(
            booking.startDate
          ).toDateString()} 
          to ${new Date(booking.endDate).toDateString()}</p>
          <p><strong>Duration:</strong> ${booking.durationDays} days</p>
        `
            : ""
        }
        
        <p><strong>Total Amount:</strong> $${booking.totalPrice.toLocaleString()}</p>
      </div>
      
      <p>You can view your booking details in your account dashboard.</p>
    </div>
  `,

  bookingCancellation: (booking, reason = "at your request") => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Booking Cancelled #${booking._id}</h2>
      <p>Your booking has been cancelled ${reason}:</p>
      
      <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0;">${booking.listing?.title || "Property"}</h3>
        ${
          booking.bookingType === "Rent"
            ? `
          <p><strong>Dates:</strong> ${new Date(
            booking.startDate
          ).toDateString()} 
          to ${new Date(booking.endDate).toDateString()}</p>
        `
            : ""
        }
      </div>
      
      <p>If this was unexpected, please contact support.</p>
    </div>
  `,

  propertyDeletedNotification: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Property Removed - Booking Cancelled</h2>
      <p>We regret to inform you that the property for your booking has been removed by the owner:</p>
      
      <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0;">${booking.listing?.title || "Property"}</h3>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        ${
          booking.bookingType === "Rent"
            ? `
          <p><strong>Dates:</strong> ${new Date(
            booking.startDate
          ).toDateString()} 
          to ${new Date(booking.endDate).toDateString()}</p>
        `
            : ""
        }
      </div>
      
      <p>Your booking has been automatically cancelled and any payments will be refunded.</p>
      <p>We apologize for any inconvenience caused.</p>
    </div>
  `,

  newBookingRequest: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Booking Request #${booking._id}</h2>
      <p>You have a new booking request for your property:</p>
      <h3>${booking.listing?.title || "Your Property"}</h3>
      <p><strong>From:</strong> ${booking.user?.fullname || "Guest"}</p>
      <p><strong>Guest Email:</strong> ${
        booking.user?.email || "Not provided"
      }</p>
      
      ${
        booking.bookingType === "Rent"
          ? `
        <p><strong>Requested Dates:</strong> ${new Date(
          booking.startDate
        ).toDateString()} 
        to ${new Date(booking.endDate).toDateString()}</p>
      `
          : ""
      }
      
      <p>Please log in to your dashboard to confirm or manage this booking.</p>
    </div>
  `,

  bookingRequestConfirmation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Request Sent #${booking._id}</h2>
      <p>Your booking request has been successfully submitted! Here are the details:</p>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0;">${booking.listing?.title || "Property"}</h3>
        <p><strong>Status:</strong> ${booking.status}</p>
        
        ${
          booking.bookingType === "Rent"
            ? `
          <p><strong>Dates:</strong> ${new Date(
            booking.startDate
          ).toDateString()} 
          to ${new Date(booking.endDate).toDateString()}</p>
          <p><strong>Duration:</strong> ${booking.durationDays} days</p>
        `
            : ""
        }
        
        <p><strong>Total Amount:</strong> $${booking.totalPrice.toLocaleString()}</p>
      </div>
      
      <p>We’ll notify you once the owner confirms your booking.</p>
    </div>
  `,
};

// Email functions
export const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      html: templates.otp(otp),
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export const notifyAgent = async (ownerEmail, bookingDetails) => {
  if (!ownerEmail) {
    throw new Error("No owner email provided");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: `New Booking Request #${bookingDetails._id}`,
      html: templates.newBookingRequest(bookingDetails),
    });
  } catch (error) {
    console.error("Error sending agent notification:", error);
    throw error;
  }
};

export const notifyBookingCancellation = async (
  email,
  bookingDetails,
  reason
) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Cancelled #${bookingDetails._id}`,
      html: templates.bookingCancellation(bookingDetails, reason),
    });
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
};

// Utility function for sending templated emails
export const sendEmail = async (to, subject, templateName, data) => {
  let htmlContent;
  if (data?.html) {
    htmlContent = data.html; // Use custom HTML if provided
  } else if (!templates[templateName]) {
    throw new Error(`Template ${templateName} not found`);
  } else {
    htmlContent = templates[templateName](data);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Error sending ${templateName || "custom"} email:`, error);
    throw error;
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation #${bookingDetails._id}`,
      html: templates.bookingConfirmation(bookingDetails),
    });

    // Save notification
    await Notification.create({
      userId: bookingDetails.userId || bookingDetails.user._id,
      title: "Booking Confirmed",
      message: `Your booking for ${bookingDetails.listing?.title} has been confirmed`,
      type: "booking_confirmation",
      relatedEntity: bookingDetails._id,
      relatedEntityModel: "Booking",
      metadata: {
        bookingType: bookingDetails.bookingType,
        totalPrice: bookingDetails.totalPrice,
      },
    });
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    throw error;
  }
};

export const notifyPropertyDeleted = async (email, bookingDetails) => {
  try {
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Important: Property Removed - Booking Cancelled #${bookingDetails._id}`,
      html: templates.propertyDeletedNotification(bookingDetails),
    });

    // Save notification
    await Notification.create({
      userId: bookingDetails.userId || bookingDetails.user._id,
      title: "Property Removed",
      message: `The property for your booking ${bookingDetails._id} has been removed by the owner`,
      type: "property_deleted",
      relatedEntity: bookingDetails._id,
      relatedEntityModel: "Booking",
      metadata: {
        refundAmount: bookingDetails.totalPrice,
        refundStatus: "pending",
      },
    });
  } catch (error) {
    console.error("Error sending property deletion notification:", error);
    throw error;
  }
};

export const sendBookingRequestConfirmation = async (email, bookingDetails) => {
  try {
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Request Sent #${bookingDetails._id}`,
      html: templates.bookingRequestConfirmation(bookingDetails),
    });

    // Save notification
    await Notification.create({
      userId: bookingDetails.userId || bookingDetails.user._id,
      title: "Booking Request Sent",
      message: `Your booking request for ${bookingDetails.listing?.title} has been sent`,
      type: "booking_request",
      relatedEntity: bookingDetails._id,
      relatedEntityModel: "Booking",
      metadata: {
        bookingType: bookingDetails.bookingType,
        totalPrice: bookingDetails.totalPrice,
      },
    });
  } catch (error) {
    console.error("Error sending booking request confirmation:", error);
    throw error;
  }
};
