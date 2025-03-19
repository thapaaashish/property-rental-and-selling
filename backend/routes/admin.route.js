import express from "express";
import { signupAdmin, signinAdmin, signoutAdmin, updateAdminProfile, updateAdminPassword } from "../controllers/admin.controller.js";
import { verifyAdminToken } from "../utils/verifyAdmin.js";

const router = express.Router();

router.post("/signup", signupAdmin);
router.post("/signin", signinAdmin);
router.post("/signout", signoutAdmin);
router.post("/update/:id", verifyAdminToken, updateAdminProfile);
router.post("/update-password", verifyAdminToken, updateAdminPassword);

export default router;