import Wishlist from "../models/wishlist.model.js";
import { errorHandler } from "../utils/error.js";
import mongoose from "mongoose";

// Add to wishlist
export const addToWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const { id } = req.user;

  if (!propertyId) {
    return next(errorHandler(400, "Property ID is required"));
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(errorHandler(400, "Invalid Property ID"));
  }

  try {
    let wishlist = await Wishlist.findOne({ user: id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: id, properties: [] });
    }

    if (wishlist.properties.includes(propertyId)) {
      return next(errorHandler(400, "Property already in wishlist"));
    }

    wishlist.properties.push(propertyId);
    await wishlist.save();

    res.status(200).json({ message: "Property added to wishlist" });
  } catch (error) {
    next(error);
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const { id } = req.user;

  if (!propertyId) {
    return next(errorHandler(400, "Property ID is required"));
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(errorHandler(400, "Invalid Property ID"));
  }

  try {
    const wishlist = await Wishlist.findOne({ user: id });

    if (!wishlist) {
      return next(errorHandler(404, "Wishlist not found"));
    }

    wishlist.properties = wishlist.properties.filter(
      (id) => id.toString() !== propertyId
    );
    await wishlist.save();

    res.status(200).json({ message: "Property removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

// Get wishlist
export const getWishlist = async (req, res, next) => {
  const { id } = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const wishlist = await Wishlist.findOne({ user: id }).populate({
      path: "properties",
      select: "title price address imageUrls",
      options: { limit, skip },
    });

    if (!wishlist) {
      return res.status(200).json([]);
    }

    res.status(200).json(wishlist.properties);
  } catch (error) {
    next(error);
  }
};
