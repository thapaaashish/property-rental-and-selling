import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Popup from "../common/Popup";

const ReasonInputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Provide Reason",
  actionLabel = "Submit",
  entityName = "item",
  loading = false,
}) => {
  const [reason, setReason] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setPopupMessage(`Please provide a reason for ${entityName}`);
      setPopupType("error");
      setShowPopup(true);
      return;
    }
    onSubmit(reason);
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
      <div className="absolute inset-0 opacity-50" onClick={handleClose} />
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      <div className="bg-gray-100 rounded-lg p-6 w-full max-w-md shadow-lg z-20">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for {entityName}:
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="4"
          placeholder={`Enter reason for ${entityName}...`}
          disabled={loading}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonInputModal;
