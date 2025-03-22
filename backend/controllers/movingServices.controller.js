import MovingService from "../models/movingService.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.send("Moving services test route being called!!");
};

export const getAllMovingServices = async (req, res, next) => {
  try {
    const movingServices = await MovingService.find().populate(
      "createdBy",
      "username"
    );
    res.status(200).json(movingServices);
  } catch (error) {
    next(errorHandler(500, "Server error fetching moving services"));
  }
};

export const getMovingServiceById = async (req, res, next) => {
  try {
    const movingService = await MovingService.findById(req.params.id).populate(
      "createdBy",
      "username"
    );
    if (!movingService) {
      return next(errorHandler(404, "Moving service not found"));
    }
    res.status(200).json(movingService);
  } catch (error) {
    next(errorHandler(500, "Server error fetching moving service"));
  }
};

export const createMovingService = async (req, res, next) => {
  const { name, contact, locations, description, servicesOffered } = req.body;

  if (!req.admin || req.admin.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const existingService = await MovingService.findOne({ name });
    if (existingService) {
      return next(
        errorHandler(400, "A moving service with this name already exists")
      );
    }

    const movingService = new MovingService({
      name,
      contact,
      locations,
      description,
      servicesOffered,
      createdBy: req.admin.id, // Admin ID from verifyAdminToken
    });

    const savedService = await movingService.save();
    await savedService.populate("createdBy", "username");
    res.status(201).json(savedService);
  } catch (error) {
    next(errorHandler(400, "Invalid data provided"));
  }
};

export const updateMovingService = async (req, res, next) => {
  const { name, contact, locations, description, servicesOffered } = req.body;

  if (!req.admin || req.admin.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const movingService = await MovingService.findById(req.params.id);
    if (!movingService) {
      return next(errorHandler(404, "Moving service not found"));
    }

    // Update fields if provided
    movingService.name = name || movingService.name;
    movingService.contact = contact || movingService.contact;
    movingService.locations = locations || movingService.locations;
    movingService.description = description || movingService.description;
    movingService.servicesOffered =
      servicesOffered || movingService.servicesOffered;

    const updatedService = await movingService.save();
    await updatedService.populate("createdBy", "username");
    res.status(200).json(updatedService);
  } catch (error) {
    next(errorHandler(400, "Invalid data provided"));
  }
};

export const deleteMovingService = async (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return next(errorHandler(403, "Admin access required"));
  }

  try {
    const movingService = await MovingService.findById(req.params.id);
    if (!movingService) {
      return next(errorHandler(404, "Moving service not found"));
    }

    await movingService.deleteOne();
    res.status(200).json({ message: "Moving service deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Server error deleting moving service"));
  }
};