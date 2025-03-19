import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminToken } from "../utils/verifyAdmin.js";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  getListingsByUser,
  getAllListings,
} from "../controllers/listing.controller.js";

const router = express.Router();

// Create a new listing (requires authentication)
router.post("/create", verifyToken, createListing);

// Delete a listing by ID (requires authentication)
router.delete("/delete/:id", [verifyToken, verifyAdminToken], deleteListing);

// Update a listing by ID (requires authentication)
router.patch("/update/:id", [verifyToken, verifyAdminToken], updateListing);

// Get a single listing by ID (public route)
router.get("/listings/:id", getListing);

// Get all listings (public route)
router.get("/listings", getListings);

router.get("/user/:userId", getListingsByUser);

router.get("/all", verifyAdminToken, getAllListings);

export default router;
