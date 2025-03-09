import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    listingType: {
      type: String,
      required: true,
      enum: ["Room", "Apartment", "House", "Villa", "Condo"],
    },
    rentOrSale: { type: String, required: true, enum: ["Rent", "Sale"] },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
      state: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    amenities: {
      type: [String],
      required: true,
      validate: {
        validator: function (amenities) {
          return amenities.length > 0; // Ensure at least one amenity is selected
        },
        message: "Please select at least one amenity.",
      },
    },
    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: function (urls) {
          return urls.length > 0 && urls.length <= 6; // Ensure at least 1 image and no more than 6
        },
        message: "You must upload between 1 and 6 images.",
      },
    },
    userRef: { type: String, required: true },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
