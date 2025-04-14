import MovingService from "../models/movingService.model.js";
import { errorHandler } from "../utils/error.js";

// Create a new moving service (Admin only)
export const createMovingService = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  const { name, contact, locations, description, servicesOffered } = req.body;

  // Validate input
  if (
    !name ||
    !contact?.phone ||
    !contact?.email ||
    !locations?.length ||
    !description ||
    !servicesOffered?.length
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const newService = new MovingService({
      name,
      contact,
      locations,
      description,
      servicesOffered,
      createdBy: req.user.id,
    });

    await newService.save();
    res.status(201).json({
      message: "Moving service created successfully",
      service: newService,
    });
  } catch (error) {
    next(errorHandler(500, "Error creating moving service"));
  }
};

// Get all moving services (Admin only)
export const getAllMovingServices = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const services = await MovingService.find().populate(
      "createdBy",
      "fullname email"
    );
    res.status(200).json(services);
  } catch (error) {
    next(errorHandler(500, "Error fetching moving services"));
  }
};

// New public controller
export const getPublicMovingServices = async (req, res, next) => {
  try {
    const services = await MovingService.find().select("-createdBy");
    res.status(200).json(services);
  } catch (error) {
    next(errorHandler(500, "Error fetching public moving services"));
  }
};
