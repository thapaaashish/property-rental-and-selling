import express from "express";
import {
  initiatePayment,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/initiate", verifyToken, initiatePayment);
router.post("/verify", verifyToken, verifyPayment);
export default router;
