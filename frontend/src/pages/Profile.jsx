import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess } from '../redux/user/userSlice';

const Profile = () => {
const { currentUser } = useSelector((state) => state.user);
const dispatchEvent = useDispatch();

const handleDeleteUser = async()=>{
  try {
    dispatchEvent(deleteUserStart());
    const res = await fetch(`http://localhost:3000/backend/user/delete/${currentUser._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if(data.sucess=== false){
      dispatchEvent(deleteUserFailure(data.message));
      return;
    }

    dispatchEvent(deleteUserSuccess(data));

  } catch (error) {
    dispatchEvent(deleteUserFailure(error.message));

  }
}

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {/* Profile Picture */}
      <div  id="photo">
      <img
          src={currentUser.avatar}
          alt="User Avatar"
          className="w-24 h-24 rounded-full bg-gray-300 mb-6"
        />
      </div>

      {/* Profile Details */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-80">
        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border-b border-gray-300 focus:outline-none py-1" defaultValue={currentUser.fullname} id="fullname"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border-b border-gray-300 focus:outline-none py-1 cursor-not-allowed" defaultValue= { currentUser.email } id="email"
            readOnly
          />
        </div>

        {/* Update Button */}
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 w-full mb-4">
          Update
        </button>

        {/* Delete Account & Sign Out */}
        <div className="flex justify-between text-red-500 text-sm">
          <button onClick={handleDeleteUser} className="hover:underline">Delete My Account</button>
          <button className="hover:underline">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;