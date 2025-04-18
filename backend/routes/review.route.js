import express from "express";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/:propertyId", getReviews);
router.post("/", verifyToken, createReview);
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;
