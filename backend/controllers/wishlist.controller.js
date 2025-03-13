import Wishlist from "../models/wishlist.model.js";
import { errorHandler } from "../utils/error.js";

// Add to wishlist
export const addToWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const { id } = req.user;

  if (!propertyId) {
    return next(errorHandler(400, "Property ID is required"));
  }

  try {
    let wishlist = await Wishlist.findOne({ user: id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: id, properties: [] });
    }

    // Check if the property is already in the wishlist
    if (wishlist.properties.includes(propertyId)) {
      return next(errorHandler(400, "Property already in wishlist"));
    }

    // Add the property to the wishlist
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

  try {
    const wishlist = await Wishlist.findOne({ user: id });

    if (!wishlist) {
      return next(errorHandler(404, "Wishlist not found"));
    }

    // Remove the property from the wishlist
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

  try {
    const wishlist = await Wishlist.findOne({ user: id }).populate(
      "properties"
    );

    if (!wishlist) {
      return res.status(200).json([]); // Return an empty array if no wishlist exists
    }

    res.status(200).json(wishlist.properties);
  } catch (error) {
    next(error);
  }
};
