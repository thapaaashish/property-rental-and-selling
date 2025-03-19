import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.admin_access_token;
  console.log("Token received:", token); // Debug log

  if (!token) return next(errorHandler(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err) {
      console.error("Token verification error:", err); // Debug log
      if (err.name === "TokenExpiredError") {
        return next(errorHandler(401, "Token expired"));
      }
      return next(errorHandler(403, "Forbidden"));
    }
    req.admin = admin; // { id, role }
    next();
  });
};
