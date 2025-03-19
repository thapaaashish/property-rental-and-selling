import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js"; // Import Admin model

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!token) {
    return next(errorHandler(401, "Unauthorized: No access token provided"));
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === "admin") {
      req.admin = { id: decoded.id, role: decoded.role };
    } else {
      req.user = { id: decoded.id };
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" && refreshToken) {
      try {
        // Verify the refresh token
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        let entity;

        // Check the appropriate model based on type
        if (refreshDecoded.type === "admin") {
          entity = await Admin.findById(refreshDecoded.id);
          if (!entity || entity.refreshToken !== refreshToken) {
            return next(errorHandler(403, "Forbidden: Invalid refresh token"));
          }
          req.admin = { id: refreshDecoded.id, role: entity.role };
        } else {
          entity = await User.findById(refreshDecoded.id);
          if (!entity || entity.refreshToken !== refreshToken) {
            return next(errorHandler(403, "Forbidden: Invalid refresh token"));
          }
          req.user = { id: refreshDecoded.id };
        }

        // Issue a new access token
        const newAccessToken = jwt.sign(
          {
            id: refreshDecoded.id,
            type: refreshDecoded.type,
            role: entity?.role,
          }, // Include type and role
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        // Set the new access token in the cookie
        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        next();
      } catch (refreshErr) {
        console.error("Refresh token error:", refreshErr);
        return next(
          errorHandler(403, "Forbidden: Invalid or expired refresh token")
        );
      }
    } else {
      console.error("Access token error:", err);
      return next(
        errorHandler(403, "Forbidden: Invalid or expired access token")
      );
    }
  }
};
