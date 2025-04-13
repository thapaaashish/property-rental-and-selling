import React, { useState, useEffect } from "react";
import { Home, Lock, Unlock } from "lucide-react";
import axios from "axios";
import Popup from "../Popup";

const PropertiesTab = ({
  properties: initialProperties = [],
  handleDeleteProperty,
  actionLoading,
  navigate,
}) => {
  const [properties, setProperties] = useState(initialProperties);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Sync initialProperties if provided
  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  // Fetch properties if initialProperties is empty
  useEffect(() => {
    if (!initialProperties.length && !properties.length) {
      const fetchProperties = async () => {
        try {
          const response = await axios.get("/api/admin/listings", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          setProperties(response.data.listings || []);
        } catch (error) {
          console.error("Error fetching properties:", error);
          setPopupMessage("Failed to load properties");
          setPopupType("error");
          setShowPopup(true);
        }
      };
      fetchProperties();
    }
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const handleLockToggle = async (propertyId, lock) => {
    try {
      const response = await axios.patch(
        `/api/admin/listings/${propertyId}/lock`,
        {
          adminLockedStatus: lock,
          ...(lock ? { status: "inactive" } : {}), // Set status to inactive when locking
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setProperties((prev) =>
          prev.map((property) =>
            property._id === propertyId
              ? {
                  ...property,
                  adminLockedStatus: lock,
                  ...(lock ? { status: "inactive" } : {}),
                }
              : property
          )
        );
        setPopupMessage(
          response.data.message || `Listing ${lock ? "locked" : "unlocked"}`
        );
        setPopupType("success");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error in handleLockToggle:", error.response || error);
      setPopupMessage(
        error.response?.data?.message || "Failed to update lock status"
      );
      setPopupType("error");
      setShowPopup(true);
    }
  };

  return (
    <div className="p-6">
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Properties</h2>
      </div>
      {properties.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no properties in the system yet.
          </p>
          <button
            onClick={() => navigate("/create-listing")}
            className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400 transition duration-150"
          >
            Create a Property
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
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map((property) => {
                const isLocked = property.adminLockedStatus === true;

                return (
                  <tr key={property._id}>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                          {property.imageUrls?.length > 0 ? (
                            <img
                              src={property.imageUrls[0]}
                              alt={property.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/48?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                              <Home className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.bedrooms} BD · {property.bathrooms} BA ·{" "}
                            {property.area} sqft
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.rentOrSale === "Sale"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {property.rentOrSale}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      ${property.price}
                      {property.rentOrSale === "Rent" && "/mo"}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusStyles[property.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {property.status}
                        </span>
                        {isLocked && (
                          <span className="text-xs text-red-500 italic">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(property.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/edit-listing/${property._id}`)
                          }
                          className="text-teal-500 hover:text-teal-600"
                          disabled={actionLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property._id)}
                          className="text-red-500 hover:text-red-600"
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() =>
                            handleLockToggle(property._id, !isLocked)
                          }
                          className={`flex items-center text-sm font-medium px-2 py-1 rounded-md transition duration-150 ${
                            isLocked
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-red-500 text-white hover:bg-red-600"
                          } disabled:opacity-50`}
                          disabled={actionLoading}
                        >
                          {isLocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </>
                          )}
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

export default PropertiesTab;
