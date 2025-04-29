import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  ArrowLeft,
  Upload,
  X,
  Home,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Layers,
  Wifi,
  MapPin,
  Calendar,
} from "lucide-react";
import Popup from "../common/Popup";
import LocationStep from "./LocationStep";
import ImagesStep from "./ImagesStep";
import ReviewSection from "./ReviewSection";
import FormInput from "./FormInput";

const API_BASE = import.meta.env.VITE_API_URL;

// GoogleMapComponent
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

// Main Component
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
    nearbyAmenities: "",
    imageUrls: [],
    userRef: "",
    yearBuilt: "", // Added yearBuilt
    propertyType: "Residential", // Added propertyType with default value
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (formData.listingType === "Room") {
      setFormData((prev) => ({ ...prev, rentOrSale: "Rent" }));
      setErrors((prev) => ({ ...prev, rentOrSale: "" }));
    }
  }, [formData.listingType]);

  useEffect(() => {
    setIsValid(validateStep());
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearBuilt" ? Number(value) || "" : value, // Convert yearBuilt to number or keep as empty string
    }));
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

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
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
      submitted
    )
      return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/listings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });

      if (response.ok) {
        setSubmitted(true);
        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
        setTimeout(() => setSubmitted(false), 3500);
      } else {
        console.error("Submission failed:", await response.text());
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
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
      if (!formData.propertyType) newErrors.propertyType = "Required";
      if (
        formData.yearBuilt &&
        (formData.yearBuilt < 1800 ||
          formData.yearBuilt > new Date().getFullYear())
      )
        newErrors.yearBuilt = `Year must be between 1800 and ${new Date().getFullYear()}`;
    }
    if (step === 3) {
      if (!formData.address.city)
        newErrors.address = { ...newErrors.address, city: "Required" };
      if (!formData.address.state)
        newErrors.address = { ...newErrors.address, state: "Required" };
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
    <div className="min-h-5 bg-gray-50 p-2 md:p-4">
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
      <div className="max-w-3xl mx-auto">
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
          )}
          {step === 1 && (
            <div className="space-y-4">
              <FormInput
                label="Rent or Sale"
                name="rentOrSale"
                type="radio"
                onChange={handleChange}
                value={formData.rentOrSale}
                options={
                  formData.listingType === "Room" ? ["Rent"] : ["Rent", "Sale"]
                }
                error={errors.rentOrSale}
                required
                disabled={formData.listingType === "Room"}
              />
              {formData.listingType === "Room" && (
                <p className="text-sm text-gray-500">
                  Rooms can only be listed for rent.
                </p>
              )}
            </div>
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
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <FormInput
                label="Price (Rs)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
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
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <FormInput
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                error={errors.bathrooms}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <FormInput
                label="Area (sqft)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                error={errors.area}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <FormInput
                label="Year Built"
                name="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={handleChange}
                error={errors.yearBuilt}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <FormInput
                label="Property Type"
                name="propertyType"
                type="select"
                value={formData.propertyType}
                onChange={handleChange}
                options={["Residential", "Commercial", "Industrial"]}
                error={errors.propertyType}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
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
            <LocationStep
              formData={formData}
              errors={errors}
              handleAddressChange={handleAddressChange}
              handleChange={handleLocationChange}
            />
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
                      className="h-4 w-4 text-gray-900 border-gray-200 rounded focus:ring-2 focus:ring-gray-300"
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
            <ImagesStep
              files={files}
              setFiles={setFiles}
              formData={formData}
              handleRemoveImage={handleRemoveImage}
              uploading={uploading}
              imageUploadError={imageUploadError}
              handleImageSubmit={handleImageSubmit}
            />
          )}
          {step === 6 && <ReviewSection formData={formData} />}
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-3xl mx-auto p-4 flex justify-between">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Previous
            </button>
          )}
          <button
            onClick={step < steps.length - 1 ? nextStep : handleSubmit}
            disabled={!isValid || submitting || submitted}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed`}
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
