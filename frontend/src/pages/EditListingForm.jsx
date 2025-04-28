import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const steps = [
  "Property Type",
  "Rent or Sale",
  "Property Details",
  "Location",
  "Amenities",
  "Images",
  "Review",
];

const containerStyle = {
  width: "100%",
  height: "300px",
};

// GoogleMapComponent for reverse geocoding
const GoogleMapComponent = ({ location, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: location.coordinates[1],
    lng: location.coordinates[0],
  });

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const address = {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        };

        addressComponents.forEach((component) => {
          if (component.types.includes("route")) {
            address.street = component.long_name;
          }
          if (component.types.includes("locality")) {
            address.city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            address.state = component.long_name;
          }
          if (component.types.includes("postal_code")) {
            address.zip = component.long_name;
          }
          if (component.types.includes("country")) {
            address.country = component.long_name;
          }
        });

        onLocationSelect(lat, lng, address);
      } else {
        console.error("Geocoding failed:", data.status);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          }}
          zoom={12}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

const EditListingForm = ({ listing, onSave, onCancel, currentUser }) => {
  const [editStep, setEditStep] = useState(0);
  const [editFormData, setEditFormData] = useState({
    listingType: listing.listingType || "",
    rentOrSale: listing.rentOrSale || "",
    title: listing.title || "",
    description: listing.description || "",
    price: listing.price || 1,
    bedrooms: listing.bedrooms || 1,
    bathrooms: listing.bathrooms || 1,
    area: listing.area || 1,
    address: listing.address || {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    location: listing.location || { type: "Point", coordinates: [0, 0] },
    amenities: listing.amenities || [],
    nearbyAmenities: listing.nearbyAmenities || "", // Added nearbyAmenities
    imageUrls: listing.imageUrls || [],
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);

  useEffect(() => {
    setEditFormData({
      listingType: listing.listingType || "",
      rentOrSale: listing.rentOrSale || "",
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price || 1,
      bedrooms: listing.bedrooms || 1,
      bathrooms: listing.bathrooms || 1,
      area: listing.area || 1,
      address: listing.address || {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
      location: listing.location || { type: "Point", coordinates: [0, 0] },
      amenities: listing.amenities || [],
      nearbyAmenities: listing.nearbyAmenities || "", // Added nearbyAmenities
      imageUrls: listing.imageUrls || [],
    });
  }, [listing]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + editFormData.imageUrls.length <= 6) {
      setUploading(true);
      try {
        const uploadPromises = files.map((file) => {
          const data = new FormData();
          data.append("file", file);
          data.append(
            "upload_preset",
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
          );
          data.append("folder", "HomeFinder/listings");
          return fetch(
            `https://api.cloudinary.com/v1_1/${
              import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
              method: "POST",
              body: data,
            }
          ).then((res) => res.json());
        });
        const results = await Promise.all(uploadPromises);
        const urls = results.map((result) => result.secure_url);
        setEditFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
        setFiles([]);
      } catch (error) {
        setImageUploadError("Image upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    console.log("Updating listing at:", `/api/listings/update/${listing._id}`);
    console.log("Form Data:", editFormData);
    try {
      const response = await fetch(`/api/listings/update/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedListing = await response.json();
      onSave(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error.message);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Edit Listing - Step {editStep + 1}: {steps[editStep]}
      </h3>
      <div className="space-y-4">
        {editStep === 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              name="listingType"
              value={editFormData.listingType}
              onChange={handleEditChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Type</option>
              {["Room", "Apartment", "House"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
        {editStep === 1 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rent or Sale
            </label>
            {["Rent", "Sale"].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="rentOrSale"
                  value={option}
                  checked={editFormData.rentOrSale === option}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
        {editStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                placeholder="Title"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleEditChange}
                placeholder="Price"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={editFormData.bedrooms}
                onChange={handleEditChange}
                placeholder="Bedrooms"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
                disabled={editFormData.listingType === "Room"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={editFormData.bathrooms}
                onChange={handleEditChange}
                placeholder="Bathrooms"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (sqft)
              </label>
              <input
                type="number"
                name="area"
                value={editFormData.area}
                onChange={handleEditChange}
                placeholder="Area (sqft)"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                placeholder="Description"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
                rows="3"
              />
            </div>
          </div>
        )}
        {editStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <GoogleMapComponent
              location={editFormData.location}
              onLocationSelect={(lat, lng, address) => {
                setEditFormData((prev) => ({
                  ...prev,
                  location: {
                    type: "Point",
                    coordinates: [lng, lat], // [longitude, latitude]
                  },
                  address: {
                    ...prev.address,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    country: address.country,
                  },
                }));
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  name="street"
                  value={editFormData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Street"
                  className="w-full p-2 border rounded bg-white bg-opacity-95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  name="city"
                  value={editFormData.address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full p-2 border rounded bg-white bg-opacity-95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  name="state"
                  value={editFormData.address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  className="w-full p-2 border rounded bg-white bg-opacity-95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP
                </label>
                <input
                  name="zip"
                  value={editFormData.address.zip}
                  onChange={handleAddressChange}
                  placeholder="ZIP"
                  className="w-full p-2 border rounded bg-white bg-opacity-95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  name="country"
                  value={editFormData.address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="w-full p-2 border rounded bg-white bg-opacity-95"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nearby Amenities
              </label>
              <textarea
                name="nearbyAmenities"
                value={editFormData.nearbyAmenities}
                onChange={handleEditChange}
                placeholder="e.g., Coffee shop 0.5 miles away, bus stop nearby"
                className="w-full p-2 border rounded bg-white bg-opacity-95"
                rows="3"
              />
            </div>
          </div>
        )}
        {editStep === 4 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Wifi",
                "Balcony",
                "Parking",
                "Pool",
                "Gym",
                "Air Conditioning",
              ].map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={editFormData.amenities.includes(amenity)}
                    onChange={handleAmenitiesChange}
                    className="mr-2"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {editStep === 5 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
              className="mb-2"
            />
            <button
              onClick={handleImageSubmit}
              disabled={uploading}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {imageUploadError && (
              <p className="text-red-500 mt-2">{imageUploadError}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {editFormData.imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt="Property"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {editStep === 6 && (
          <div className="space-y-2">
            <p>
              <strong>Type:</strong> {editFormData.listingType}
            </p>
            <p>
              <strong>Rent/Sale:</strong> {editFormData.rentOrSale}
            </p>
            <p>
              <strong>Title:</strong> {editFormData.title}
            </p>
            <p>
              <strong>Description:</strong> {editFormData.description}
            </p>
            <p>
              <strong>Price:</strong> ${editFormData.price}
            </p>
            <p>
              <strong>Bedrooms:</strong> {editFormData.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {editFormData.bathrooms}
            </p>
            <p>
              <strong>Area:</strong> {editFormData.area} sqft
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {Object.values(editFormData.address).join(", ")}
            </p>
            <p>
              <strong>Amenities:</strong>{" "}
              {editFormData.amenities.length > 0
                ? editFormData.amenities.join(", ")
                : "None"}
            </p>
            <p>
              <strong>Nearby Amenities:</strong>{" "}
              {editFormData.nearbyAmenities || "None"}
            </p>
            <p>
              <strong>Images:</strong>{" "}
              {editFormData.imageUrls.length > 0
                ? editFormData.imageUrls.length + " uploaded"
                : "None"}
            </p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        {editStep > 0 && (
          <button
            onClick={() => setEditStep((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
        )}
        {editStep < steps.length - 1 ? (
          <button
            onClick={() => setEditStep((prev) => prev + 1)}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditListingForm;
