import Wishlist from "../models/wishlist.model.js";
import { errorHandler } from "../utils/error.js";

export const addToWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const { id } = req.user; // Authenticated user ID

  try {
    // Find the user's wishlist or create a new one
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

export const removeFromWishlist = async (req, res, next) => {
  const { propertyId } = req.body;
  const { id } = req.user; // Authenticated user ID

  try {
    // Find the user's wishlist
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

export const getWishlist = async (req, res, next) => {
  const { id } = req.user; // Authenticated user ID

  try {
    // Find the user's wishlist and populate the properties
    const wishlist = await Wishlist.findOne({ user: id }).populate(
      "properties"
    );

    if (!wishlist) {
      return res.status(200).json([]); // Return an empty array if no wishlist exists
    }

    res.status(200).json(wishlist.properties);
  } catch (error) {
    console.error("Error fetching wishlist:", error); // Log the error
    next(error);
  }
};
