import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1742463191/blank-profile-picture-973460_1280_u3cxlw.webp",
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpires: {
      type: Date,
      required: false,
    },
    resetPasswordOTP: {
      type: String,
      required: false,
    },
    resetPasswordOTPExpires: {
      type: Date,
      required: false,
    },
    phone: { type: String },
    address: { type: String, default: "None" },
    city: { type: String, default: "None" },
    province: { type: String, default: "None" },
    zipCode: { type: String, default: "None" },
    profileCompleted: { type: Boolean, default: false },
    refreshToken: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // Default to regular user
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
