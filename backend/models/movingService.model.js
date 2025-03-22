import mongoose from "mongoose";

const MovingServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        match: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation
      },
      email: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // Matches your email regex
      },
    },
    locations: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    servicesOffered: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const MovingService = mongoose.model("MovingService", MovingServiceSchema);

export default MovingService;