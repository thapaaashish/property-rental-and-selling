import express from "express";
import {
  createMovingService,
  getAllMovingServices,
  getPublicMovingServices,
} from "../controllers/movingServices.controller.js";
import { verifyToken, isAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// Public routes

// Admin routes for moving services
router.post("/", verifyToken, isAdmin, createMovingService);
router.get("/", verifyToken, isAdmin, getAllMovingServices);

// Public route (no authentication)
router.get("/public", getPublicMovingServices);

export default router;
