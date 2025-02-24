import React, { useState } from 'react';
import FormInput from './FormInput';

const AddListingForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    listingType: 'rent',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // Add API call or further processing here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Title"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter property title"
        required
      />
      <FormInput
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe your property"
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter price"
          required
        />
        <FormInput
          label="Property Type"
          name="propertyType"
          type="select"
          value={formData.propertyType}
          onChange={handleChange}
          options={['Apartment', 'House', 'Villa', 'Condo', 'Townhouse']}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Listing Type"
          name="listingType"
          type="radio"
          value={formData.listingType}
          onChange={handleChange}
          options={['rent', 'sale']}
          required
        />
        <FormInput
          label="Bedrooms"
          name="bedrooms"
          type="number"
          value={formData.bedrooms}
          onChange={handleChange}
          placeholder="Number of bedrooms"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Bathrooms"
          name="bathrooms"
          type="number"
          value={formData.bathrooms}
          onChange={handleChange}
          placeholder="Number of bathrooms"
          required
        />
        <FormInput
          label="Area (sqft)"
          name="area"
          type="number"
          value={formData.area}
          onChange={handleChange}
          placeholder="Property area in sqft"
          required
        />
      </div>
      <FormInput
        label="Location"
        name="location"
        type="text"
        value={formData.location}
        onChange={handleChange}
        placeholder="Enter property location"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
        <input
          type="file"
          name="images"
          onChange={handleImageUpload}
          multiple
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Submit Listing
      </button>
    </form>
  );
};

export default AddListingForm;