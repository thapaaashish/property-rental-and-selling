import express from "express";
import { test, deleteUser, updateProfile, uploadProfilePicture } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.delete("/delete/:id", verifyToken, deleteUser);
router.post("/update/:id", verifyToken, updateProfile);
router.post("/upload-profile-picture", verifyToken, uploadProfilePicture);

export default router;
