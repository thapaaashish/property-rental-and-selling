import React from 'react';
import AddListingForm from '../components/CreateListingForm';
import { useSelector } from 'react-redux';

const CreateListing = () => {
  const currentUser = useSelector((state) => state.user.currentUser);

  if (!currentUser) {
    // Redirect the user or show an error if they are not logged in
    return <div>Please log in to create a listing</div>;
  }

  return (
    <div>
      <AddListingForm />
    </div>
  );
};

export default CreateListing;
