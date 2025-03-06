import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../../redux/user/userSlice";

const DeleteAccount = ({ onClose }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(
        `/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-md shadow-md">
      <p className="text-gray-700 text-sm text-center">
        Are you sure you want to delete your account?
        This action cannot be undone.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
