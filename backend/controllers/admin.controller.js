import Admin from "../models/admin.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

export const signupAdmin = async (req, res, next) => {
  try {
    const { fullname, email, password, phone, role } = req.body;

    // Validate required fields
    if (!fullname || !email || !password) {
      return next(
        errorHandler(400, "Fullname, email, and password are required")
      );
    }

    // Check if email is already in use
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return next(errorHandler(400, "Email already in use"));

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      fullname,
      email,
      password: hashedPassword,
      phone,
      role: role || "moderator", // Default role to 'moderator' if not provided
    });

    // Save to database
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error"));
  }
};

// Admin Sign In
export const signinAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return next(errorHandler(404, "Admin not found"));

    const validPassword = bcryptjs.compareSync(password, admin.password);
    if (!validPassword) return next(errorHandler(401, "Invalid credentials"));

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    admin.lastLogin = new Date();
    await admin.save();

    const { password: _, ...adminData } = admin._doc;
    res
      .cookie("admin_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json(adminData);
  } catch (error) {
    next(error);
  }
};

// Admin Sign Out
export const signoutAdmin = (req, res) => {
  res
    .clearCookie("admin_access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Signed out successfully" });
};

// Update Admin Profile
export const updateAdminProfile = async (req, res, next) => {
  const { fullname, email } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return next(errorHandler(404, "Admin not found"));

    admin.fullname = fullname || admin.fullname;
    admin.email = email || admin.email;

    const updatedAdmin = await admin.save();
    const { password, ...adminData } = updatedAdmin._doc;
    res.status(200).json(adminData);
  } catch (error) {
    next(error);
  }
};

// Update Admin Password
export const updateAdminPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return next(errorHandler(404, "Admin not found"));

    const validPassword = bcryptjs.compareSync(currentPassword, admin.password);
    if (!validPassword)
      return next(errorHandler(401, "Invalid current password"));

    admin.password = bcryptjs.hashSync(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
