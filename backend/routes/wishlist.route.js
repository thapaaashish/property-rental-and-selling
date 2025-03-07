import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/add", verifyToken, addToWishlist);
router.post("/remove", verifyToken, removeFromWishlist);
router.get("/get", verifyToken, getWishlist);

export default router;
