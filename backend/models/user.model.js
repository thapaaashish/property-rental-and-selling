import mongoose from 'mongoose';

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
            type: Number,
            required: false,
        },
        otpExpires: {
            type: Date,
            required: false,
        },
        resetPasswordOTP: String,
        resetPasswordOTPExpires: Date
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User;
