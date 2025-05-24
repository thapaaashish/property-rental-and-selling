import React, { useState, useEffect, useMemo } from "react";
import { Home, Lock, Unlock, Eye, Trash2, Loader2, Search } from "lucide-react";
import axios from "axios";
import Popup from "../common/Popup";
import DeleteConfirmation from "../common/DeleteConfirmation";
import { MapWithAllProperties } from "../GoogleMap";
import ReasonInputModal from "./ReasonInputModal";
import RefreshButton from "../common/RefreshButton";

const API_BASE = import.meta.env.VITE_API_URL;

const PropertiesTab = ({
  properties: initialProperties = [],
  handleDeleteProperty,
  actionLoading,
  navigate,
  currentUser,
}) => {
  const [properties, setProperties] = useState(initialProperties);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showLockReasonModal, setShowLockReasonModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Check if user is authenticated
  const isAuthenticated = () => !!currentUser?.refreshToken;

  // Sync initialProperties if provided
  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  // Fetch properties
  const fetchProperties = async () => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to view properties");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/admin/listings`, {
        headers: {
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
        withCredentials: true,
      });
      const listings = Array.isArray(response.data)
        ? response.data
        : response.data.listings || [];
      setProperties(listings);
      setPopupMessage("Properties refreshed successfully");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching properties:", error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to refresh properties"
        );
        setPopupType("error");
        setShowPopup(true);
      }
    }
  };

  // Initial fetch if no properties and authenticated
  useEffect(() => {
    if (!initialProperties.length && !properties.length && isAuthenticated()) {
      fetchProperties();
    }
  }, [initialProperties, properties.length, currentUser]);

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Apply search filter (by title or owner name)
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.userRef?.fullname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (property) => property.status === filterStatus
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (property) => property.rentOrSale === filterType
      );
    }

    return filtered;
  }, [properties, searchTerm, filterStatus, filterType]);

  // Memoized map markers with safer access
  const mapMarkers = useMemo(() => {
    return filteredProperties
      .filter(
        (prop) =>
          Array.isArray(prop?.location?.coordinates) &&
          prop.location.coordinates.length === 2
      )
      .map((property) => ({
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
        title: property.title || "Unnamed Property",
      }));
  }, [filteredProperties]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const handleLockToggle = async (propertyId, lock) => {
    if (lock) {
      setSelectedPropertyId(propertyId);
      setShowLockReasonModal(true);
    } else {
      setLoadingStates((prev) => ({ ...prev, [propertyId]: true }));
      try {
        if (!currentUser?.refreshToken) {
          setPopupMessage("Please log in to perform this action");
          setPopupType("error");
          setShowPopup(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        const response = await axios.patch(
          `${API_BASE}/api/admin/listings/${propertyId}/lock`,
          { adminLockedStatus: false },
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );
        setProperties((prev) =>
          prev.map((property) =>
            property._id === propertyId
              ? { ...property, adminLockedStatus: false }
              : property
          )
        );
        setPopupMessage(response.data.message || "Listing unlocked");
        setPopupType("success");
        setShowPopup(true);
      } catch (error) {
        console.error("Error in handleLockToggle:", error.response || error);
        if (error.response?.status === 401) {
          setPopupMessage("Session expired. Please log in again.");
          setPopupType("error");
          setShowPopup(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setPopupMessage(
            error.response?.data?.message || "Failed to update lock status"
          );
          setPopupType("error");
          setShowPopup(true);
        }
      } finally {
        setTimeout(() => {
          setLoadingStates((prev) => ({ ...prev, [propertyId]: false }));
        }, 500);
      }
    }
  };

  const handleLockSubmit = async (reason) => {
    setLoadingStates((prev) => ({ ...prev, [selectedPropertyId]: true }));
    try {
      if (!currentUser?.refreshToken) {
        setPopupMessage("Please log in to perform this action");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      const response = await axios.patch(
        `${API_BASE}/api/admin/listings/${selectedPropertyId}/lock`,
        {
          adminLockedStatus: true,
          reason,
          status: "inactive",
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      setProperties((prev) =>
        prev.map((property) =>
          property._id === selectedPropertyId
            ? {
                ...property,
                adminLockedStatus: true,
                status: "inactive",
              }
            : property
        )
      );
      setPopupMessage(response.data.message || "Listing locked");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error in handleLockSubmit:", error.response || error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to lock property"
        );
        setPopupType("error");
        setShowPopup(true);
      }
    } finally {
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [selectedPropertyId]: false }));
        setShowLockReasonModal(false);
        setSelectedPropertyId(null);
      }, 500);
    }
  };

  const MapEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-6">
      <Home className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-gray-500 text-xs">No property locations available</p>
    </div>
  );

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
      <ReasonInputModal
        isOpen={showLockReasonModal}
        onClose={() => {
          setShowLockReasonModal(false);
          setSelectedPropertyId(null);
        }}
        onSubmit={handleLockSubmit}
        title="Lock Property"
        actionLabel="Lock Property"
        entityName="locking this property"
        loading={loadingStates[selectedPropertyId] || false}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">All Properties</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by property or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-40 py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-40 py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>
          <RefreshButton
            onRefresh={fetchProperties}
            disabled={actionLoading || !isAuthenticated()}
          />
        </div>
      </div>
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-4">
            {isAuthenticated()
              ? "No properties match your search or filter criteria."
              : "Please log in to view properties."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Property Locations
              </h2>
              <button
                onClick={() => navigate("/properties")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {mapMarkers.length === 0 ? (
              <MapEmptyState />
            ) : (
              <div className="h-64">
                <MapWithAllProperties markers={mapMarkers} />
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-sm border border-gray-100">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
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
                {filteredProperties.map((property) => {
                  const isLocked = property.adminLockedStatus === true;
                  const isLoading = loadingStates[property._id] || false;

                  return (
                    <tr key={property._id}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                            {property.imageUrls?.length > 0 ? (
                              <img
                                src={property.imageUrls[0]}
                                alt={property.title || "Property"}
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
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {property.title || "Unnamed Property"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms || "N/A"} BD ·{" "}
                              {property.bathrooms || "N/A"} BA ·{" "}
                              {property.area || "N/A"} sqft
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[150px]">
                        {property.userRef?.fullname || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.rentOrSale === "Sale"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {property.rentOrSale || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        ${property.price || "N/A"}
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
                            {property.status || "N/A"}
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
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              navigate(`/property/${property._id}`)
                            }
                            className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full"
                            disabled={actionLoading || isLoading}
                            title="View property"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <DeleteConfirmation
                            itemName="property"
                            onDelete={() => handleDeleteProperty(property._id)}
                            disabled={actionLoading || isLoading}
                          />
                          <button
                            onClick={() =>
                              handleLockToggle(property._id, !isLocked)
                            }
                            className={`p-2 rounded-full ${
                              isLocked
                                ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                : "text-red-600 hover:text-red-800 hover:bg-red-50"
                            }`}
                            disabled={actionLoading || isLoading}
                            title={
                              isLocked ? "Unlock property" : "Lock property"
                            }
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isLocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
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
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
