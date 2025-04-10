import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { ArrowLeft, CheckCircle, Upload, X } from "lucide-react";
import Popup from "../components/Popup"; // Adjust the import path as needed

// FormInput Component (unchanged)
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "radio" ? (
        <div className="flex gap-6">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-2 text-gray-700"
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={onChange}
                disabled={disabled}
                className="h-4 w-4 text-gray-900 border-gray-200 rounded-full focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// GoogleMapComponent (unchanged)
const steps = [
  "Property Type",
  "Rent or Sale",
  "Details",
  "Location",
  "Amenities",
  "Images",
  "Review",
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
  const [selectedLocation, setSelectedLocation] = useState(null);

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
          if (component.types.includes("route"))
            address.street = component.long_name;
          if (component.types.includes("locality"))
            address.city = component.long_name;
          if (component.types.includes("administrative_area_level_1"))
            address.state = component.long_name;
          if (component.types.includes("postal_code"))
            address.zip = component.long_name;
          if (component.types.includes("country"))
            address.country = component.long_name;
        });

        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <div className="h-80 w-full rounded-lg border border-gray-200 overflow-hidden">
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

// Main Component with Submission Fix
const CreateListingForm = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    listingType: "",
    rentOrSale: "",
    title: "",
    description: "",
    price: 1,
    bedrooms: 1,
    bathrooms: 1,
    area: 1,
    address: { street: "", city: "", state: "", zip: "", country: "" },
    location: { type: "Point", coordinates: [0, 0] },
    amenities: [],
    imageUrls: [],
    userRef: "",
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // New state for submission
  const [submitted, setSubmitted] = useState(false); // Tracks successful submission
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    setIsValid(validateStep());
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (selectedFiles.length > 0)
      setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (droppedFiles.length > 0) setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
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
        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls.concat(urls),
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
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      step !== steps.length - 1 ||
      !isValid ||
      !currentUser?._id ||
      submitting ||
      submitted // Prevent submission if already submitted
    )
      return;

    setSubmitting(true); // Disable submit button
    try {
      const response = await fetch("/api/listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });

      if (response.ok) {
        setSubmitted(true); // Mark as submitted
        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate("/"); // Navigate after popup duration
        }, 3000); // Matches popup duration
        setTimeout(() => setSubmitted(false), 3500); // Re-enable after 3 seconds
      } else {
        console.error("Submission failed:", await response.text());
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false); // Re-enable submit button
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0 && !formData.listingType) newErrors.listingType = "Required";
    if (step === 1 && !formData.rentOrSale) newErrors.rentOrSale = "Required";
    if (step === 2) {
      if (!formData.title) newErrors.title = "Required";
      if (!formData.description) newErrors.description = "Required";
      if (!formData.price) newErrors.price = "Required";
      if (formData.listingType !== "Room" && !formData.bedrooms)
        newErrors.bedrooms = "Required";
      if (!formData.bathrooms) newErrors.bathrooms = "Required";
      if (!formData.area) newErrors.area = "Required";
    }
    if (step === 3) {
      if (!formData.address.city)
        newErrors.address = { ...newErrors.address, city: "Required" };
      if (!formData.address.state)
        newErrors.address = { ...newErrors.address, state: "Required" };
      if (!formData.address.zip)
        newErrors.address = { ...newErrors.address, zip: "Required" };
      if (!formData.address.country)
        newErrors.address = { ...newErrors.address, country: "Required" };
      if (
        !formData.location.coordinates[0] ||
        !formData.location.coordinates[1]
      )
        newErrors.location = "Select a location";
    }
    if (step === 4 && formData.amenities.length === 0)
      newErrors.amenities = "Select at least one";
    if (step === 5 && formData.imageUrls.length === 0)
      newErrors.images = "Upload at least one";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-3xl mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= step ? "bg-gray-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto pt-20 pb-24">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          New Listing
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Step {step + 1}: {steps[step]}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 0 && (
            <FormInput
              label="Property Type"
              name="listingType"
              type="select"
              onChange={handleChange}
              value={formData.listingType}
              options={["Room", "Apartment", "House"]}
              error={errors.listingType}
              required
            />
          )}
          {step === 1 && (
            <FormInput
              label="Rent or Sale"
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
            <div className="space-y-4">
              <FormInput
                label="Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
              />
              <FormInput
                label="Price (Rs)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                required
              />
              <FormInput
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                error={errors.bedrooms}
                required={formData.listingType !== "Room"}
                disabled={formData.listingType === "Room"}
              />
              <FormInput
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                error={errors.bathrooms}
                required
              />
              <FormInput
                label="Area (sqft)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                error={errors.area}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <GoogleMapComponent
                onLocationSelect={(lat, lng, address) => {
                  setFormData((prev) => ({
                    ...prev,
                    location: { type: "Point", coordinates: [lng, lat] },
                    address,
                  }));
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Street"
                  name="street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                />
                <FormInput
                  label="City"
                  name="city"
                  type="text"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  error={errors.address?.city}
                  required
                />
                <FormInput
                  label="State"
                  name="state"
                  type="text"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  error={errors.address?.state}
                  required
                />
                <FormInput
                  label="ZIP Code"
                  name="zip"
                  type="text"
                  value={formData.address.zip}
                  onChange={handleAddressChange}
                  error={errors.address?.zip}
                  required
                />
                <FormInput
                  label="Country"
                  name="country"
                  type="text"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  error={errors.address?.country}
                  required
                />
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-3">
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
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenitiesChange}
                      className="h-4 w-4 text-gray-900 border-gray-200 rounded"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
              {errors.amenities && (
                <p className="text-sm text-red-500 mt-2">{errors.amenities}</p>
              )}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <label className="flex items-center justify-center gap-2 text-gray-600 cursor-pointer">
                  <Upload size={20} />
                  <span>
                    Drop images or <span className="text-gray-900">browse</span>
                  </span>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG</p>
              </div>
              {(files.length > 0 || formData.imageUrls.length > 0) && (
                <div className="flex flex-wrap gap-3">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setFiles((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
                        className="absolute top-1 right-1 bg-gray-900 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-gray-900 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleImageSubmit}
                disabled={uploading || files.length === 0}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {imageUploadError && (
                <p className="text-sm text-red-500">{imageUploadError}</p>
              )}
            </div>
          )}
          {step === 6 && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4">
              <p>
                <strong>Type:</strong> {formData.listingType}
              </p>
              <p>
                <strong>Rent/Sale:</strong> {formData.rentOrSale}
              </p>
              <p>
                <strong>Title:</strong> {formData.title}
              </p>
              <p>
                <strong>Description:</strong> {formData.description}
              </p>
              <p>
                <strong>Price:</strong> Rs {formData.price}
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
                <strong>Address:</strong>{" "}
                {Object.values(formData.address).filter(Boolean).join(", ")}
              </p>
              <p>
                <strong>Location:</strong> {formData.location.coordinates[1]},{" "}
                {formData.location.coordinates[0]}
              </p>
              <p>
                <strong>Amenities:</strong> {formData.amenities.join(", ")}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-3xl mx-auto p-4 flex justify-between">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
            >
              Previous
            </button>
          )}
          <button
            onClick={step < steps.length - 1 ? nextStep : handleSubmit}
            disabled={!isValid || submitting || submitted} // Disable if submitted
            className={`px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400`}
          >
            {step < steps.length - 1
              ? "Next"
              : submitting
              ? "Submitting..."
              : submitted
              ? "Submitted"
              : "Submit"}
          </button>
        </div>
      </div>

      {showSuccessPopup && (
        <Popup
          message="Listing submitted!"
          type="success"
          duration={3000}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
      {showErrorPopup && (
        <Popup
          message="Failed to submit listing. Please try again."
          type="error"
          duration={3000}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
};

export default CreateListingForm;
