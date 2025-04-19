import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

// Upload KYC Document
export const uploadKycDocument = async (req, res, next) => {
  const { documentUrl, documentType } = req.body;
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (user.kyc.status === "pending") {
      return next(errorHandler(400, "KYC verification is already pending"));
    }
    if (user.kyc.status === "verified") {
      return next(errorHandler(400, "KYC is already verified"));
    }

    user.kyc.documentUrl = documentUrl;
    user.kyc.documentType = documentType;
    user.kyc.status = "pending";
    user.kyc.submittedAt = new Date();
    user.kyc.rejectedReason = null;

    await user.save();

    const { password, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: "KYC document uploaded successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};

// Get KYC Status
export const getKycStatus = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      kycStatus: user.kyc.status,
      rejectedReason: user.kyc.rejectedReason || null,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Verify KYC Document
export const verifyKycDocument = async (req, res, next) => {
  const { userId, status, rejectedReason } = req.body;

  if (!req.user || req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (!["verified", "rejected"].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }

    user.kyc.status = status;
    if (status === "verified") {
      user.kyc.verifiedAt = new Date();
      user.kyc.rejectedReason = null;
    } else if (status === "rejected") {
      user.kyc.rejectedReason = rejectedReason || "No reason provided";
      user.kyc.verifiedAt = null;
    }

    await user.save();

    const { password, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Pending KYC Requests
export const getPendingKycRequests = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const users = await User.find({ "kyc.status": "pending" }).select(
      "fullname email kyc"
    );
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};
