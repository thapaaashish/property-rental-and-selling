import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import Popup from "../Popup"; // Adjust path as needed

const DeleteAccount = ({ onClose }) => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteUser = async () => {
    if (!currentUser || !currentUser._id) {
      setError("No user is logged in");
      setConfirmText("");
      return;
    }

    console.log("Attempting to delete user:", currentUser._id);

    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (!res.ok) {
        let errorMessage = data.message || "Failed to delete account";
        if (res.status === 401) {
          errorMessage = "Session expired. Please sign in again.";
          setError(errorMessage);
          dispatch(deleteUserFailure(errorMessage));
          setTimeout(() => {
            navigate("/sign-in");
          }, 3000); // Navigate after popup
          setConfirmText("");
          return;
        }
        dispatch(deleteUserFailure(errorMessage));
        setError(errorMessage);
        setConfirmText("");
        return;
      }

      // Handle success (backend may omit success: true)
      if (data.message === "User deleted successfully") {
        dispatch(deleteUserSuccess());
        navigate("/sign-in"); // Navigate immediately, no success popup
        return;
      }

      // Fallback for unexpected responses
      dispatch(deleteUserFailure(data.message || "Failed to delete account"));
      setError(data.message || "Failed to delete account");
      setConfirmText("");
    } catch (error) {
      console.error("Delete error:", error.message);
      dispatch(deleteUserFailure(error.message));
      setError(error.message || "An error occurred while deleting the account");
      setConfirmText("");
    }
  };

  const handleClosePopup = () => {
    setError(null);
  };

  const handleCancel = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-md shadow-md">
      <p className="text-gray-700 text-sm text-center">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
      <input
        type="text"
        placeholder="Type DELETE to confirm"
        className="w-full p-2 border rounded-md focus:outline-none focus:border-sky-500"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />
      <div className="flex space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-300"
          disabled={confirmText !== "DELETE" || loading}
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </div>
      {/* Popup Wrapper with High z-index */}
      {error && (
        <div className="fixed z-[1000]">
          <Popup
            message={error}
            type="error"
            duration={5000}
            onClose={handleClosePopup}
          />
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
