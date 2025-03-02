import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
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
    imagesUrls: { type: Array, required: true },
    userRef: { type: String, required: true },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
