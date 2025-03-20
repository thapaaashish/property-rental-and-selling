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

        const newAccessToken = jwt.sign(
          {
            id: refreshDecoded.id,
            type: refreshDecoded.type,
            role: entity?.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" } // Access token lasts 7 days
        );

        const newRefreshToken = jwt.sign(
          { id: refreshDecoded.id, type: refreshDecoded.type },
          process.env.JWT_SECRET,
          { expiresIn: "30d" } // Refresh token lasts 30 days
        );

        // Update refresh token in the database
        entity.refreshToken = newRefreshToken;
        await entity.save();

        // Set cookies
        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
