import express from "express";
import {
  test,
  getAllMovingServices,
  getMovingServiceById,
  createMovingService,
  updateMovingService,
  deleteMovingService,
} from "../controllers/movingServices.controller.js";

const router = express.Router();

router.get("/test", test);
// Public routes
router.get("/", getAllMovingServices);
router.get("/:id", getMovingServiceById);
// // Admin-only routes
// router.post("/create", verifyAdminToken, createMovingService);
// router.put("/update/:id", verifyAdminToken, updateMovingService);
// router.delete("/delete/:id", verifyAdminToken, deleteMovingService);

export default router;