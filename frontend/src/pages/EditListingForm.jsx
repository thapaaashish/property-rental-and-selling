import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import FormInput from "../components/PropertyListing/FormInput";
import { Calendar } from "lucide-react";

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
    nearbyAmenities: listing.nearbyAmenities || "",
    imageUrls: listing.imageUrls || [],
    yearBuilt: listing.yearBuilt || "", // Added yearBuilt
    propertyType: listing.propertyType || "Residential", // Added propertyType with default
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

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
      nearbyAmenities: listing.nearbyAmenities || "",
      imageUrls: listing.imageUrls || [],
      yearBuilt: listing.yearBuilt || "", // Added yearBuilt
      propertyType: listing.propertyType || "Residential", // Added propertyType
    });
  }, [listing]);

  useEffect(() => {
    setIsValid(validateStep());
  }, [editFormData, editStep]);

  useEffect(() => {
    if (editFormData.listingType === "Room") {
      setEditFormData((prev) => ({ ...prev, rentOrSale: "Rent" }));
      setErrors((prev) => ({ ...prev, rentOrSale: "" }));
    }
  }, [editFormData.listingType]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "yearBuilt" ? Number(value) || "" : value, // Convert yearBuilt to number or keep as empty string
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    setErrors((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: "" },
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
    setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
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
            { method: "POST", body: data }
          ).then((response) => response.json());
        });

        const results = await Promise.all(uploadPromises);
        const urls = results.map((result) => result.secure_url);
        setEditFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
        setFiles([]);
      } catch (error) {
        setImageUploadError("Image upload failed.");
      } finally {
        setUploading(false);
      }
    } else {
      setImageUploadError("Upload 1-6 images.");
    }
  };

  const handleRemoveImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    console.log("Updating listing at:", `/api/listings/update/${listing._id}`);
    console.log("Form Data:", editFormData);
    try {
      const response = await fetch(`/api/listings/update/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`, // Added Authorization header for consistency with CreateListingForm
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

  const validateStep = () => {
    const newErrors = {};
    if (editStep === 0 && !editFormData.listingType)
      newErrors.listingType = "Required";
    if (editStep === 1 && !editFormData.rentOrSale)
      newErrors.rentOrSale = "Required";
    if (editStep === 2) {
      if (!editFormData.title) newErrors.title = "Required";
      if (!editFormData.description) newErrors.description = "Required";
      if (!editFormData.price) newErrors.price = "Required";
      if (editFormData.listingType !== "Room" && !editFormData.bedrooms)
        newErrors.bedrooms = "Required";
      if (!editFormData.bathrooms) newErrors.bathrooms = "Required";
      if (!editFormData.area) newErrors.area = "Required";
      if (!editFormData.propertyType) newErrors.propertyType = "Required";
      if (
        editFormData.yearBuilt &&
        (editFormData.yearBuilt < 1800 ||
          editFormData.yearBuilt > new Date().getFullYear())
      )
        newErrors.yearBuilt = `Year must be between 1800 and ${new Date().getFullYear()}`;
    }
    if (editStep === 3) {
      if (!editFormData.address.city)
        newErrors.address = { ...newErrors.address, city: "Required" };
      if (!editFormData.address.state)
        newErrors.address = { ...newErrors.address, state: "Required" };
      if (!editFormData.address.country)
        newErrors.address = { ...newErrors.address, country: "Required" };
      if (
        !editFormData.location.coordinates[0] ||
        !editFormData.location.coordinates[1]
      )
        newErrors.location = "Select a location";
    }
    if (editStep === 4 && editFormData.amenities.length === 0)
      newErrors.amenities = "Select at least one";
    if (editStep === 5 && editFormData.imageUrls.length === 0)
      newErrors.images = "Upload at least one";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setEditStep((prev) => prev + 1);
  };

  const prevStep = () => setEditStep((prev) => prev - 1);

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Edit Listing - Step {editStep + 1}: {steps[editStep]}
      </h3>
      <div className="space-y-4">
        {editStep === 0 && (
          <FormInput
            label="Property Type"
            name="listingType"
            type="select"
            value={editFormData.listingType}
            onChange={handleEditChange}
            options={["Room", "Apartment", "House"]}
            error={errors.listingType}
            required
            className="w-full p-2 border rounded bg-white bg-opacity-95"
          />
        )}
        {editStep === 1 && (
          <div className="space-y-2">
            <FormInput
              label="Rent or Sale"
              name="rentOrSale"
              type="radio"
              value={editFormData.rentOrSale}
              onChange={handleEditChange}
              options={
                editFormData.listingType === "Room"
                  ? ["Rent"]
                  : ["Rent", "Sale"]
              }
              error={errors.rentOrSale}
              required
              disabled={editFormData.listingType === "Room"}
            />
            {editFormData.listingType === "Room" && (
              <p className="text-sm text-gray-500">
                Rooms can only be listed for rent.
              </p>
            )}
          </div>
        )}
        {editStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Title"
              name="title"
              type="text"
              value={editFormData.title}
              onChange={handleEditChange}
              error={errors.title}
              required
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Price (Rs)"
              name="price"
              type="number"
              value={editFormData.price}
              onChange={handleEditChange}
              error={errors.price}
              required
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={editFormData.bedrooms}
              onChange={handleEditChange}
              error={errors.bedrooms}
              required={editFormData.listingType !== "Room"}
              disabled={editFormData.listingType === "Room"}
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={editFormData.bathrooms}
              onChange={handleEditChange}
              error={errors.bathrooms}
              required
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Area (sqft)"
              name="area"
              type="number"
              value={editFormData.area}
              onChange={handleEditChange}
              error={errors.area}
              required
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Year Built"
              name="yearBuilt"
              type="number"
              value={editFormData.yearBuilt}
              onChange={handleEditChange}
              error={errors.yearBuilt}
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
            <FormInput
              label="Property Type"
              name="propertyType"
              type="select"
              value={editFormData.propertyType}
              onChange={handleEditChange}
              options={["Residential", "Commercial", "Industrial"]}
              error={errors.propertyType}
              required
              className="w-full p-2 border rounded bg-white bg-opacity-95"
            />
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
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
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
              <FormInput
                label="Street"
                name="street"
                type="text"
                value={editFormData.address.street}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
              <FormInput
                label="City"
                name="city"
                type="text"
                value={editFormData.address.city}
                onChange={handleAddressChange}
                error={errors.address?.city}
                required
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
              <FormInput
                label="State"
                name="state"
                type="text"
                value={editFormData.address.state}
                onChange={handleAddressChange}
                error={errors.address?.state}
                required
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
              <FormInput
                label="ZIP"
                name="zip"
                type="text"
                value={editFormData.address.zip}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
              <FormInput
                label="Country"
                name="country"
                type="text"
                value={editFormData.address.country}
                onChange={handleAddressChange}
                error={errors.address?.country}
                required
                className="w-full p-2 border rounded bg-white bg-opacity-95"
              />
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
                "CCTV Surveillance",
                "Solar Power",
                "Rooftop Access",
                "Garden",
                "Elevator",
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
            {errors.amenities && (
              <p className="text-sm text-red-500">{errors.amenities}</p>
            )}
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
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:bg-teal-300"
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
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}
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
              <strong>Price:</strong> Rs {editFormData.price.toLocaleString()}
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
              <strong>Year Built:</strong>{" "}
              {editFormData.yearBuilt || (
                <span className="text-gray-500">-</span>
              )}
              {editFormData.yearBuilt && (
                <Calendar
                  size={16}
                  className="inline-block ml-1 text-gray-400"
                />
              )}
            </p>
            <p>
              <strong>Property Type:</strong> {editFormData.propertyType}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {Object.values(editFormData.address).filter(Boolean).join(", ")}
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
            onClick={prevStep}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
        )}
        {editStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={!isValid}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
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
