import express from "express";
import {
  test,
  deleteUser,
  updateProfile,
  uploadProfilePicture,
  getUserDetails,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminToken } from "../utils/verifyAdmin.js";

const router = express.Router();

router.get("/test", test);
// Allow both user and admin to delete, with different permissions
router.delete("/delete/:id", [verifyToken, verifyAdminToken], deleteUser);
router.post("/update/:id", [verifyToken, verifyAdminToken], updateProfile);
router.post("/upload-profile-picture", verifyToken, uploadProfilePicture);
router.get("/:id", verifyToken, getUserDetails);
router.get("/all", verifyAdminToken, getAllUsers);

export default router;
