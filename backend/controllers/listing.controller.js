import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(403, "You can only delete your own listings"));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(403, "You can only update your own listings"));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    // Fetch basic agent information
    const agent = await User.findById(listing.userRef).select(
      "fullname email phone avatar"
    );

    // Log the agent data to verify it's being fetched correctly
    console.log("Agent Data:", agent);

    // Combine listing and agent data
    const listingWithAgent = {
      ...listing._doc, // Use _doc to get the raw document object
      agent: agent
        ? {
            fullname: agent.fullname,
            email: agent.email,
            phone: agent.phone,
            avatar: agent.avatar,
          }
        : null,
    };

    // Log the final response to verify the data structure
    console.log("Listing with Agent:", listingWithAgent);
    res.status(200).json(listingWithAgent);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let listingType = req.query.listingType || "all";
    let propertyType = req.query.type || "all";

    let query = {};

    // Filter by listing type (rent or sale)
    if (listingType !== "all") {
      query.rentOrSale = listingType === "buy" ? "Sale" : "Rent";
    }

    // Filter by property type (apartment, house, etc.)
    if (propertyType !== "all") {
      query.listingType =
        propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
