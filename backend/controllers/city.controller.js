import City from "../models/city.model.js";
import Listing from "../models/listing.model.js";

// Fetch cities with property counts
export const getCitiesWithProperties = async (req, res) => {
  try {
    // Aggregate property count by city
    const propertyCounts = await Listing.aggregate([
      {
        $group: {
          _id: "$address.city", // Group by city (address.city is the city reference)
          propertyCount: { $sum: 1 }, // Count properties per city
        },
      },
    ]);

    // Fetch all cities
    const cities = await City.find();

    // Map cities to their property count
    const citiesWithProperties = cities.map((city) => {
      const propertyData = propertyCounts.find(
        (count) => count._id.toString() === city._id.toString()
      );
      return {
        id: city._id,
        name: city.name,
        image: city.image,
        properties: propertyData ? propertyData.propertyCount : 0,
      };
    });

    res.json(citiesWithProperties);
  } catch (err) {
    console.error("Error fetching cities with properties:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
