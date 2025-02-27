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
            match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
          },
        avatar: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
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
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User;
