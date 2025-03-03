import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    listingType: {
      type: String,
      required: true,
      enum: ["Room", "Apartment", "House", "Villa", "Condo"],
    },
    rentOrSale: { type: String, required: true, enum: ["Rent", "Sale"] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: function (urls) {
          return urls.every((url) => /^https?:\/\/\S+$/.test(url)); // Basic URL validation
        },
        message: "Invalid image URLs provided.",
      },
    },
    userRef: { type: String, required: true },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
