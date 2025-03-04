import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import GoogleMapComponent from "./GoogleMap";
import { useSelector } from "react-redux";

const steps = [
  "Choose Property Type",
  "Rent or Sale",
  "Property Details",
  "Location & Address",
  "Amenities",
  "Upload Images",
  "Review & Submit",
];

const CreateListingForm = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    listingType: "",
    rentOrSale: "",
    title: "",
    description: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    amenities: [],
    imageUrls: [],
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

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError(false);

      try {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const data = new FormData();
          data.append("file", file);
          data.append(
            "upload_preset",
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
          );

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${
              import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
              method: "POST",
              body: data,
            }
          );

          if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Cloudinary API Error:", errorResponse);
            throw new Error("Failed to upload image");
          }

          const result = await response.json();
          if (result.secure_url) {
            urls.push(result.secure_url);
          }
        }

        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
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
        const response = await fetch("/backend/listings/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            userRef: currentUser._id,
          }),
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
      <div className="fixed top-0 left-0 right-0 bg-white z-50 outline outline-offset-2 ">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            {/* Go Back Button */}
            <button
              onClick={handleGoBack}
              className="flex items-center cursor-pointer hover:outline-1 rounded-2xl p-2.5 text-gray-600 hover:text-gray-800 transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
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
              Go Back
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
      <div className="max-w-4xl mx-auto mb-24">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Add a New Listing
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to list your property for rent or sale.
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
                        type="text"
                        value={formData.address.city}
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
                <>
                  {/* Image Upload Section */}
                  <div className="mt-4">
                    <label className="flex gap-3.5 text-sm font-medium text-gray-700 mb-3">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      name="images"
                      onChange={(e) => setFiles(e.target.files)}
                      accept="image/*"
                      multiple
                      required
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imageUploadError && (
                      <p className="text-sm text-red-500 mt-1">
                        {imageUploadError}
                      </p>
                    )}

                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                      type="button"
                      onClick={handleImageSubmit}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>

                  {/* Display Uploaded Images */}
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={url}
                          alt="Property"
                          className="w-full h-full rounded-md object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                          onClick={() => handleRemoveImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50 outline outline-offset-2 ">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between">
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isValid}
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
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
