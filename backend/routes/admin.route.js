import express from "express";
import { verifyToken, isAdmin } from "../utils/verifyUser.js";
import {
  getAllUsers,
  getAllListings,
  deleteListing,
  getAllBookings,
  deleteUser,
  createAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Admin routes with verifyToken and isAdmin middleware
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/listings", verifyToken, isAdmin, getAllListings);
router.delete("/listings/:id", verifyToken, isAdmin, deleteListing);
router.get("/bookings", verifyToken, isAdmin, getAllBookings);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
router.post("/create-admin", verifyToken, isAdmin, createAdmin);

export default router;
