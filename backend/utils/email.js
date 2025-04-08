import nodemailer from "nodemailer";

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Reuse your existing OTP email function
export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification OTP",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// New function for booking confirmation
export const sendBookingConfirmation = async (email, bookingDetails) => {
  if (!email) {
    console.error("No recipient email provided for booking confirmation");
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Booking Confirmation #${bookingDetails._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmation</h2>
          <p>Thank you for your booking! Here are your details:</p>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0;">${
              bookingDetails.listing?.title || "Property"
            }</h3>
            <p><strong>Booking ID:</strong> ${bookingDetails._id}</p>
            <p><strong>Status:</strong> ${bookingDetails.status}</p>
            
            ${
              bookingDetails.bookingType === "Rent"
                ? `
                <p><strong>Dates:</strong> ${new Date(
                  bookingDetails.startDate
                ).toDateString()} 
                to ${new Date(bookingDetails.endDate).toDateString()}</p>
                <p><strong>Duration:</strong> ${
                  bookingDetails.durationDays
                } days</p>
              `
                : ""
            }
            
            <p><strong>Total Amount:</strong> $${bookingDetails.totalPrice.toLocaleString()}</p>
          </div>
          
          <p>You can view your booking details in your account dashboard.</p>
          <p>If you have any questions, please reply to this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
  }
};

export const notifyAgent = async (ownerEmail, bookingDetails) => {
  if (!ownerEmail) {
    console.error("No owner email provided for agent notification");
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: `New Booking Request #${bookingDetails._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Booking Request</h2>
          <p>You have a new booking request for your property:</p>
          <h3>${bookingDetails.listing?.title || "Your Property"}</h3>
          <p><strong>From:</strong> ${
            bookingDetails.user?.fullname || "Guest"
          }</p>
          <p><strong>Guest Email:</strong> ${
            bookingDetails.user?.email || "Not provided"
          }</p>
          
          ${
            bookingDetails.bookingType === "Rent"
              ? `
              <p><strong>Requested Dates:</strong> ${new Date(
                bookingDetails.startDate
              ).toDateString()} 
              to ${new Date(bookingDetails.endDate).toDateString()}</p>
            `
              : ""
          }
          
          <p>Please log in to your dashboard to confirm or manage this booking.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending agent notification:", error);
  }
};
