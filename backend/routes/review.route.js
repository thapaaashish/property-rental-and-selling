import express from "express";
import {
  createReview,
  getReviews,
  deleteReview,
  getAllReviews,
  approveReview,
  deleteReviewAdmin,
  getPendingReviews,
} from "../controllers/review.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/property/:propertyId", getReviews);
router.post("/", verifyToken, createReview);
router.delete("/:reviewId", verifyToken, deleteReview);
router.get("/admin/reviews", verifyToken, getAllReviews);
router.get("/admin/pendingReviews", verifyToken, getPendingReviews);
router.patch(
  "/admin/pendingReviews/:reviewId/approve",
  verifyToken,
  approveReview
);
router.delete("/admin/reviews/:reviewId", verifyToken, deleteReviewAdmin);

export default router;
