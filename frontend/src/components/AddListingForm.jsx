import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import GoogleMapComponent  from "./GoogleMap";


const steps = [
  'Listing Type',
  'Rent or Sale',
  'Property Details',
  'Location & Images',
  'Review & Submit',
];

const AddListingForm = () => {
  const [step, setStep] = useState(0);
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
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Listing submitted successfully!');

    // Redirect to the home page after submission
    navigate('/');
  };

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
                  required
                />
              )}
              {step === 2 && (
                <>
                  <FormInput label="Title" name="title" type="text" value={formData.title} onChange={handleChange} required />
                  <FormInput label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} required />
                  <div className="grid grid-cols-2 gap-6">
                    <FormInput label="Price ($)" name="price" type="number" value={formData.price} onChange={handleChange} required />
                    <FormInput label="Bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} required />
                    <FormInput label="Bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} required />
                    <FormInput label="Area (sqft)" name="area" type="number" value={formData.area} onChange={handleChange} required />
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
                    required
                  />

                  {/* Google Maps Section */}
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Property Location</h3>
                    <GoogleMapComponent  />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images</label>
                    <input
                      type="file"
                      name="images"
                      onChange={handleImageUpload}
                      multiple
                      required
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
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

export default AddListingForm;
