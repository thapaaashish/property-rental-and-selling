import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Popup from "./Popup";

const DeleteConfirmation = ({
  itemName,
  onDelete,
  disabled = false,
  className = "",
}) => {
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const handleDelete = async () => {
    try {
      await onDelete();
      setIsConfirmVisible(false);
      setPopupMessage(`${capitalize(itemName)} deleted successfully`);
      setPopupType("success");
    } catch (error) {
      setPopupMessage(
        error.response?.data?.message || `Failed to delete ${itemName}`
      );
      setPopupType("error");
    } finally {
      setIsPopupVisible(true);
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <button
        onClick={() => setIsConfirmVisible(true)}
        disabled={disabled}
        className={`p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition ${className}`}
        title={`Delete ${itemName}`}
        aria-label={`Delete ${itemName}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isConfirmVisible && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Confirm Deletion
            </h3>
            <p className="mb-5 text-sm text-gray-600">
              Are you sure you want to delete this{" "}
              <span className="font-medium">{itemName.toLowerCase()}</span>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmVisible(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopupVisible && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setIsPopupVisible(false)}
        />
      )}
    </>
  );
};

export default DeleteConfirmation;
