// This route handles sending emails for property inquiries using a custom template.
// It uses the sendEmail utility function to send the email with the provided details.

import express from "express";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const {
      to,
      subject,
      message,
      propertyTitle,
      propertyPrice,
      userName,
      userEmail,
    } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Inquiry About ${propertyTitle}</h2>
        <p>Dear Agent / Owner,</p>
        <p>${message}</p>
        <p><strong>Property:</strong> ${propertyTitle}</p>
        <p><strong>Price:</strong> Rs ${propertyPrice.toLocaleString()}</p>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p>Please reply at your earliest convenience.</p>
      </div>
    `;

    await sendEmail(to, subject, "custom", { html: emailTemplate });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: error.message || "Failed to send email" });
  }
});

export default router;
