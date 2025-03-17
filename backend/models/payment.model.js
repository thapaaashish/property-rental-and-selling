import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    productId: { 
      type: String, 
      required: true 
    }, // Unique ID of the product/listing
    amount: { 
      type: Number, 
      required: true 
    }, // Total payment amount
    refId: { 
      type: String, 
      required: true 
    }, // Reference ID from the payment gateway
    status: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    }, // Payment status
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the model
export default mongoose.model("Payment", paymentSchema);