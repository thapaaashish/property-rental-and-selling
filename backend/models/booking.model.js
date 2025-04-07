import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["Rent", "Sale"],
      required: true,
    },
    startDate: {
      type: Date,
      required: function () {
        return this.bookingType === "Rent";
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return this.bookingType === "Rent";
      },
      validate: {
        validator: function (endDate) {
          if (this.bookingType === "Rent") {
            return endDate > this.startDate;
          }
          return true;
        },
        message: "End date must be after start date",
      },
    },
    durationDays: {
      type: Number,
      min: [1, "Minimum booking duration is 1 days"], // Set your minimum here
      required: function () {
        return this.bookingType === "Rent";
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    notifications: {
      confirmationSent: Boolean,
      agentNotified: Boolean,
      cancellationSent: Boolean,
    },
    expiresAt: {
      type: Date,
      default: function () {
        if (this.status === "pending") {
          return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        }
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate duration and validate
bookingSchema.pre("save", function (next) {
  if (this.bookingType === "Rent" && this.isModified("startDate", "endDate")) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.durationDays < 1) {
      // Match with min validation
      throw new Error("Minimum booking duration is 3 days");
    }
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
