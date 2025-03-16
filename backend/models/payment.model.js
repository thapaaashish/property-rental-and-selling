const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    payment_method: {
      type: String,
      required: true,
      default: "esewa",
    },
    transaction_code: String,
    amount: {
      type: Number,
      required: true,
    },

        product: {
          type: String,
          required: true,
          default: "Test",
        },
    status: {
      type: String,
      required: true,
      enum: ["created", "paid", "shipping", "delivered"],
      default: "created",
    },
    address: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", orderSchema);