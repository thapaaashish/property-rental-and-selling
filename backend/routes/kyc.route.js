import express from "express";
import {
  uploadKycDocument,
  getKycStatus,
  verifyKycDocument,
  getPendingKycRequests,
} from "../controllers/kyc.controller.js";
import { verifyToken, isAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// KYC Routes
router.post("/upload/:id", verifyToken, uploadKycDocument);
router.get("/status/:id", verifyToken, getKycStatus);
router.post("/verify", [verifyToken, isAdmin], verifyKycDocument);
router.get("/pending", [verifyToken, isAdmin], getPendingKycRequests);

export default router;
