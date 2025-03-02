import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import GoogleMapComponent from './GoogleMap';
import { Cloudinary } from '@cloudinary/url-gen';

const steps = [
  'Listing Type',
  'Rent or Sale',
  'Property Details',
  'Location & Images',
  'Review & Submit',
];

const CreateListingForm = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    listingType: '',
    propertyType: '',
    rentOrSale: '',
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    images: [],
    imageUrls: [],
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle image upload to Cloudinary
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error when user types
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length < 7 + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
  
      try {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const data = new FormData();
          data.append('file', file);
          data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: data,
            }
          );
  
          if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Cloudinary API Error:', errorResponse);
            throw new Error('Failed to upload image');
          }
  
          const result = await response.json();
          if (result.secure_url) {
            urls.push(result.secure_url); // Store the image URL
          }
        }
  
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setImageUploadError(false);
        setFiles([]); // Clear the file input
      } catch (error) {
        console.error('Image upload failed:', error);
        setImageUploadError('Image upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    } else {
      setImageUploadError('Please upload at least one image and no more than six images.');
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => (i !== index)),
    });
  };

  // Save listing data to MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        // Send the listing data to your backend API
        const response = await fetch('/backend/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Listing submitted:', result);
          alert('Listing submitted successfully!');
          navigate('/');
        } else {
          throw new Error('Failed to submit listing.');
        }
      } catch (error) {
        console.error('Error submitting listing:', error);
        alert('Failed to submit listing. Please try again.');
      }
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    // Step-specific validation
    if (step === 0 && !formData.propertyType) {
      newErrors.propertyType = 'Please select a property type.';
    }
    if (step === 1 && !formData.rentOrSale) {
      newErrors.rentOrSale = 'Please select rent or sale.';
    }
    if (step === 2) {
      if (!formData.title) newErrors.title = 'Title is required.';
      if (!formData.description) newErrors.description = 'Description is required.';
      if (!formData.price) newErrors.price = 'Price is required.';
      if (!formData.bedrooms) newErrors.bedrooms = 'Bedrooms is required.';
      if (!formData.bathrooms) newErrors.bathrooms = 'Bathrooms is required.';
      if (!formData.area) newErrors.area = 'Area is required.';
    }
    if (step === 3) {
      if (!formData.location) newErrors.location = 'Location is required.';
      if (formData.imageUrls.length === 0) newErrors.images = 'Please upload at least one image.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => setStep((prev) => prev - 1);

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 relative">
          <button
            onClick={handleGoBack}
            className="absolute left-0 top-0 flex items-center cursor-pointer hover:outline-1 rounded-2xl p-2.5 text-gray-600 hover:text-gray-800 transition duration-300"
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

          <h1 className="text-4xl font-bold text-gray-800 mb-4">Add a New Listing</h1>
          <p className="text-lg text-gray-600">Fill out the form below to list your property for rent or sale.</p>
        </header>

        <div className="bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                Step {step + 1} of {steps.length}
              </p>
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full ${index <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{steps[step]}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 0 && (
                <FormInput
                  label="What type of property?"
                  name="propertyType"
                  type="select"
                  value={formData.propertyType}
                  onChange={handleChange}
                  options={['Room', 'Apartment', 'House', 'Villa', 'Condo']}
                  error={errors.propertyType}
                  required
                />
              )}
              {step === 1 && (
                <FormInput
                  label="Is it for rent or sale?"
                  name="rentOrSale"
                  type="radio"
                  value={formData.rentOrSale}
                  onChange={handleChange}
                  options={['Rent', 'Sale']}
                  error={errors.rentOrSale}
                  required
                />
              )}
              {step === 2 && (
                <>
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
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    required
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <FormInput
                      label="Price ($)"
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
                      required
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
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <FormInput
                    label="Location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    required
                  />

                  {/* Google Maps Section */}
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Property Location</h3>
                    <GoogleMapComponent onLocationSelect={(location) => setFormData({ ...formData, location })} />
                  </div>

                  <div>
                    <label className="flex gap-3.5 text-sm font-medium text-gray-700 mb-3">Upload Images</label>
                    <input
                      type="file"
                      name="images"
                      onChange={(e) => setFiles(e.target.files)}
                      accept="image/*"
                      multiple
                      required
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imageUploadError && <p className="text-sm text-red-500 mt-1">{imageUploadError}</p>}
                    
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                      type="button"
                      onClick={handleImageSubmit}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={url} className="flex justify-between border items-center p-2 rounded-lg bg-gray-50">
                        <img src={url} alt={`listing image ${index}`} className="w-32 h-32 object-contain rounded-lg" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="text-red-500 cursor-pointer">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Review Your Listing</h3>
                  <pre className="bg-gray-50 p-6 rounded-lg text-sm overflow-auto border border-gray-200">{JSON.stringify(formData, null, 2)}</pre>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingForm;