// src/models/movingService.model.js
import mongoose from "mongoose";

const movingServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    locations: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    servicesOffered: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MovingService = mongoose.model("MovingService", movingServiceSchema);

export default MovingService;
