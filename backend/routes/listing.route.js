import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  getListingsByUser,
  getAllListings,
  updateListingStatus,
  getListingsForHomePage,
} from "../controllers/listing.controller.js";

const router = express.Router();

// Create a new listing (requires authentication)
router.post("/create", verifyToken, createListing);

// Delete a listing by ID (requires authentication)
router.delete("/delete/:id", verifyToken, deleteListing);

// Update a listing by ID (requires authentication)
router.put("/update/:id", verifyToken, updateListing);

// Get a single listing by ID (public route)
router.get("/listings/:id", getListing);

// Get all listings (public route)
router.get("/listings", getListings);
router.get("/listings-home", getListingsForHomePage);

router.get("/user/:userId", getListingsByUser);

router.get("/all", getAllListings);

router.post("/update-status/:id", verifyToken, updateListingStatus);

export default router;
