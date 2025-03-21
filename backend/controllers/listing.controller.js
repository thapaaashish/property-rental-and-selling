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

  if (req.user.id !== listing.userRef.toString()) {
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
  console.log("Update Listing called for user:", req.user?.id);
  console.log("Listing ID:", req.params.id);
  console.log("Request Body:", req.body);

  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (req.user.id !== listing.userRef.toString()) {
      return next(errorHandler(403, "You can only update your own listings"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    console.error("Error in updateListing:", error);
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
    const searchTerm = req.query.searchTerm || "";
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const bedrooms = parseInt(req.query.bedrooms) || 0;
    const bathrooms = parseInt(req.query.bathrooms) || 0;

    let listingType = req.query.listingType || "all";
    let propertyType = req.query.type || "all";

    // Debug logs
    console.log("Received listingType:", listingType);
    console.log("Received propertyType:", propertyType);

    let query = {
      price: { $gte: minPrice, $lte: maxPrice },
      bedrooms: { $gte: bedrooms },
      bathrooms: { $gte: bathrooms },
    };

    // Apply listingType filter
    if (listingType !== "all") {
      query.rentOrSale = listingType === "buy" ? "Sale" : "Rent";
    }

    // Apply propertyType filter
    if (propertyType !== "all") {
      query.listingType =
        propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
    }

    // Apply searchTerm filter
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { "address.street": { $regex: searchTerm, $options: "i" } },
        { "address.city": { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (req.query.location) {
      query.address = { $regex: req.query.location, $options: "i" }; // Case-insensitive match
    }

    // Debug log for final query
    console.log("Final Query:", query);

    const totalListings = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate("userRef", "fullname email phone avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({
      listings,
      totalListings,
      currentPage: Math.floor(startIndex / limit) + 1,
      totalPages: Math.ceil(totalListings / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getListingsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const listings = await Listing.find({ userRef: userId });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getAllListings = async (req, res, next) => {
  if (!req.admin) return next(errorHandler(403, "Admin access required"));
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
