import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";
import Popup from "../Popup";

const MyListings = ({
  listings,
  formatDate,
  handleEditListing,
  handleDeleteListing,
  handleViewListing,
  currentUser,
}) => {
  const navigate = useNavigate();
  const [statusUpdates, setStatusUpdates] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-500" },
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "sold", label: "Sold", color: "bg-blue-500" },
    { value: "rented", label: "Rented", color: "bg-purple-500" },
    { value: "inactive", label: "Inactive", color: "bg-gray-500" },
  ];

  const handleStatusChange = async (listingId, newStatus) => {
    if (!currentUser || !currentUser.refreshToken) {
      setPopupMessage("You must be logged in to update listing status");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    try {
      const response = await fetch(`/api/listings/update-status/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusUpdates((prev) => ({
          ...prev,
          [listingId]: newStatus,
        }));
        setPopupMessage("Status updated successfully!");
        setPopupType("success");
        setShowPopup(true);
      } else {
        setPopupMessage(data.message || "Failed to update status");
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage("Error updating status: Network issue");
      setPopupType("error");
      setShowPopup(true);
    }
  };

  const handleDeleteClick = (listingId) => {
    setListingToDelete(listingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await handleDeleteListing(listingToDelete);
      setPopupMessage("Listing deleted successfully!");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      setPopupMessage("Failed to delete listing");
      setPopupType("error");
      setShowPopup(true);
    }
    setShowDeleteModal(false);
    setListingToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setListingToDelete(null);
  };

  return (
    <div className="p-4 md:p-6">
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-xl font-bold text-gray-800">My Listings</h2>
        <button
          onClick={() => navigate("/create-listing")}
          className="flex items-center text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 w-full md:w-auto justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No listings yet
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't created any property listings yet.
          </p>
          <button
            onClick={() => navigate("/create-listing-landing")}
            className="text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specs
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => {
                const currentStatus =
                  statusUpdates[listing._id] || listing.status || "active";
                const statusOption = statusOptions.find(
                  (opt) => opt.value === currentStatus
                );

                return (
                  <tr key={listing._id}>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                          {listing.imageUrls?.length > 0 ? (
                            <img
                              src={listing.imageUrls[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.address.street}, {listing.address.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {listing.listingType} · {listing.rentOrSale}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {listing.bedrooms} BD · {listing.bathrooms} BA ·{" "}
                      {listing.area} sq.ft
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusOption.color}`}
                        >
                          {statusOption.label}
                        </span>
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(listing._id, e.target.value)
                          }
                          className="block w-32 pl-3 pr-8 py-1.5 text-sm cursor-pointer border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(listing.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditListing(listing._id)}
                          className="text-blue-600 hover:text-blue-900 whitespace-nowrap cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(listing._id)}
                          className="text-red-600 hover:text-red-900 whitespace-nowrap cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleViewListing(listing._id)}
                          className="text-green-600 hover:text-green-900 whitespace-nowrap cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyListings;
