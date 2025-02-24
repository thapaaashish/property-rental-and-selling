import React from 'react';
import AddListingForm from '../components/AddListingForm';

const AddListing = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Add New Listing</h1>
        <AddListingForm />
      </div>
    </div>
  );
};

export default AddListing;