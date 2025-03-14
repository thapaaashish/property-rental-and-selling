import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import { useSelector } from "react-redux";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const steps = [
  "Choose Property Type",
  "Rent or Sale",
  "Property Details",
  "Location & Address",
  "Amenities",
  "Upload Images",
  "Review & Submit",
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 27.7103,
  lng: 85.3222,
};

const GoogleMapComponent = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = React.useState(null);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    onLocationSelect(lat, lng); // Pass latitude and longitude to parent
  };

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

const CreateListingForm = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    listingType: "",
    rentOrSale: "",
    title: "",
    description: "",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    location: {
      type: "Point",
      coordinates: [0, 0], // [longitude, latitude]
    },
    amenities: [],
    imageUrls: [],
    userRef: "", // Will be populated dynamically
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    setIsValid(validateStep());
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((item) => item !== value),
    }));
    setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB.");
        return false;
      }
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB.");
        return false;
      }
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError(false);

      try {
        const uploadPromises = files.map((file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

          return fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: data,
            }
          ).then((response) => response.json());
        });

        const results = await Promise.all(uploadPromises);
        const urls = results.map((result) => result.secure_url);

        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls.concat(urls),
        }));
        setImageUploadError(false);
        setFiles([]);
      } catch (error) {
        console.error("Image upload failed:", error);
        setImageUploadError("Image upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      setImageUploadError("Please upload between 1 and 6 images.");
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step !== steps.length - 1) {
      return;
    }

    if (!currentUser || !currentUser._id) {
      alert("You must be logged in to create a listing.");
      return;
    }

    if (isValid) {
      try {
        const listingData = {
          ...formData,
          userRef: currentUser._id, // Populate userRef dynamically
        };

        const response = await fetch("/api/listings/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify(listingData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Listing submitted:", result);
          alert("Listing submitted successfully!");
          navigate("/");
        } else {
          throw new Error("Failed to submit listing.");
        }
      } catch (error) {
        console.error("Error submitting listing:", error);
        alert("Failed to submit listing. Please try again.");
      }
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 0 && !formData.listingType) {
      newErrors.listingType = "Please select a property type.";
    }

    if (step === 1 && !formData.rentOrSale) {
      newErrors.rentOrSale = "Please select rent or sale.";
    }

    if (step === 2) {
      if (!formData.title) newErrors.title = "Title is required.";
      if (!formData.description)
        newErrors.description = "Description is required.";
      if (!formData.price) newErrors.price = "Price is required.";
      if (!formData.bedrooms) newErrors.bedrooms = "Bedrooms is required.";
      if (!formData.bathrooms) newErrors.bathrooms = "Bathrooms is required.";
      if (!formData.area) newErrors.area = "Area is required.";
    }

    if (step === 3) {
      if (!formData.address.street)
        newErrors.address = {
          ...newErrors.address,
          street: "Street is required.",
        };
      if (!formData.address.city)
        newErrors.address = { ...newErrors.address, city: "City is required." };
      if (!formData.address.state)
        newErrors.address = {
          ...newErrors.address,
          state: "State is required.",
        };
      if (!formData.address.zip)
        newErrors.address = {
          ...newErrors.address,
          zip: "ZIP code is required.",
        };
      if (!formData.address.country)
        newErrors.address = {
          ...newErrors.address,
          country: "Country is required.",
        };
      if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
        newErrors.location = "Please select a location on the map.";
      }
    }

    if (step === 4 && formData.amenities.length === 0) {
      newErrors.amenities = "Please select at least one amenity.";
    }

    if (step === 5 && formData.imageUrls.length === 0) {
      newErrors.images = "Please upload at least one image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!validateStep()) {
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Fixed Steps Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 outline-offset-2 ">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            {/* Go Back Button */}
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer text-white hover:text-gray-900 bg-teal-500 hover:bg-gray-200 rounded-xl transition duration-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Go Back</span>
            </button>

            {/* Step Indicator */}
            <p className="text-sm font-medium text-gray-600">
              Step {step + 1} of {steps.length}
            </p>

            {/* Step Progress Bar */}
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    index <= step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mb-24 mt-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Add a New Listing
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to list your property.
          </p>
        </header>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {steps[step]}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Form steps */}
              {step === 0 && (
                <FormInput
                  label="What type of property?"
                  name="listingType"
                  type="select"
                  onChange={handleChange}
                  value={formData.listingType}
                  options={["Room", "Apartment", "House", "Villa", "Condo"]}
                  error={errors.listingType}
                  required
                />
              )}
              {step === 1 && (
                <FormInput
                  label="Is it for rent or sale?"
                  name="rentOrSale"
                  type="radio"
                  onChange={handleChange}
                  value={formData.rentOrSale}
                  options={["Rent", "Sale"]}
                  error={errors.rentOrSale}
                  required
                />
              )}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormInput
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="Price ($)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="Bedrooms"
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        required
                      />
                      {errors.bedrooms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bedrooms}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="Bathrooms"
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        required
                      />
                      {errors.bathrooms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bathrooms}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="Area (sqft)"
                        name="area"
                        type="number"
                        value={formData.area}
                        onChange={handleChange}
                        required
                      />
                      {errors.area && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.area}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description Field */}
                  <div className="mt-4">
                    <label className="block text-lg font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Provide a detailed description of the property..."
                      className="mt-1 w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormInput
                        label="Street"
                        name="street"
                        type="text"
                        value={formData.address.street}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.address?.street && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.street}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="City"
                        name="city"
                        type="select"
                        value={formData.address.city}
                        options={["Kathmandu", "Pokhara"]}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.address?.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="State"
                        name="state"
                        type="text"
                        value={formData.address.state}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.address?.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="ZIP Code"
                        name="zip"
                        type="text"
                        value={formData.address.zip}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.address?.zip && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.zip}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormInput
                        label="Country"
                        name="country"
                        type="text"
                        value={formData.address.country}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.address?.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.country}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Google Map Component */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Select Property Location
                    </h3>
                    <div className="h-96 w-full rounded-lg overflow-hidden">
                      <GoogleMapComponent
                        onLocationSelect={(lat, lng) => {
                          setFormData((prev) => ({
                            ...prev,
                            location: {
                              type: "Point",
                              coordinates: [lng, lat], // [longitude, latitude]
                            },
                          }));
                        }}
                      />
                    </div>
                    {formData.location.coordinates[0] &&
                      formData.location.coordinates[1] && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected Location: {formData.location.coordinates[1]},{" "}
                          {formData.location.coordinates[0]}
                        </p>
                      )}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  {/* Amenities Selection */}
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
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
                        <div key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            id={amenity}
                            name="amenities"
                            value={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={handleAmenitiesChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={amenity}
                            className="ml-2 text-gray-700"
                          >
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.amenities && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.amenities}
                      </p>
                    )}
                  </div>
                </>
              )}

              {step === 5 && (
                <div className="mt-6 space-y-4">
                  {/* Image Upload Section */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600 transition duration-300"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      Drag & Drop Images or{" "}
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        Browse
                      </span>
                      <input
                        type="file"
                        name="images"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG. Max file size: 5MB.
                    </p>
                  </div>

                  {/* Display Selected Images Before Uploading */}
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 rounded-md overflow-hidden shadow-md"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition"
                            onClick={() =>
                              setFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 text-white hover:text-gray-900 bg-teal-500 hover:bg-gray-200 text-sm font-medium rounded-md transition duration-300 disabled:bg-blue-300"
                      type="button"
                      onClick={handleImageSubmit}
                      disabled={uploading || files.length === 0}
                    >
                      {uploading ? "Uploading..." : "Upload Images"}
                    </button>
                  </div>

                  {/* Display Uploaded Images */}
                  {formData.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {formData.imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 rounded-md overflow-hidden shadow-md"
                        >
                          <img
                            src={url}
                            alt="Property"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition"
                            onClick={() => handleRemoveImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error Message */}
                  {imageUploadError && (
                    <p className="text-sm text-red-500 mt-1">
                      {imageUploadError}
                    </p>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Review Your Listing
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please check all details before submitting.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p>
                      <strong>Property Type:</strong> {formData.listingType}
                    </p>
                    <p>
                      <strong>Rent or Sale:</strong> {formData.rentOrSale}
                    </p>
                    <p>
                      <strong>Title:</strong> {formData.title}
                    </p>
                    <p>
                      <strong>Description:</strong> {formData.description}
                    </p>
                    <p>
                      <strong>Price:</strong> ${formData.price}
                    </p>
                    <p>
                      <strong>Bedrooms:</strong> {formData.bedrooms}
                    </p>
                    <p>
                      <strong>Bathrooms:</strong> {formData.bathrooms}
                    </p>
                    <p>
                      <strong>Area:</strong> {formData.area} sqft
                    </p>
                    <p>
                      <strong>Address:</strong> {formData.address.street},{" "}
                      {formData.address.city}, {formData.address.state},{" "}
                      {formData.address.zip}, {formData.address.country}
                    </p>
                    <p>
                      <strong>Location:</strong> {formData.location.coordinates[1]},{" "}
                      {formData.location.coordinates[0]}
                    </p>
                    <p>
                      <strong>Amenities:</strong>{" "}
                      {formData.amenities.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Fixed Back and Next Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between">
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300 cursor-pointer"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
                className="px-4 py-2 text-white hover:text-gray-900 bg-teal-500 hover:bg-gray-200 rounded-lg transition duration-300 cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isValid}
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer"
              >
                Submit Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingForm;