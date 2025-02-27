import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  listingType: { type: String, required: true },
  propertyType: { type: String, required: true },
  rentOrSale: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  location: { type: String, required: true },
  images: { type: [String], required: true }, // Array of file paths
}, { timestamps: true });

export default mongoose.model("Listing", listingSchema);