import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Tag,
  Phone,
  Clock,
  Home,
  ChevronDown,
  ChevronUp,
  Filter,
  User,
} from "lucide-react";
import Popup from "../components/Popup";

const AgentBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProperties, setExpandedProperties] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?._id) {
        setError("Please sign in to view booking requests");
        setLoading(false);
        return;
      }

      try {
        // Fetch properties first
        const propertiesResponse = await fetch(
          `/api/listings/user/${currentUser._id}`
        );
        const propertiesData = await propertiesResponse.json();

        if (!propertiesResponse.ok) {
          throw new Error(
            propertiesData.message || "Failed to fetch properties"
          );
        }

        setProperties(propertiesData);

        // Then fetch all bookings for these properties
        const listingIds = propertiesData.map((property) => property._id);
        const bookingsResponse = await fetch(`/api/bookings/for-listings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingIds }),
        });
        const bookingsData = await bookingsResponse.json();

        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.message || "Failed to fetch bookings");
        }

        setBookings(bookingsData);

        // Initialize expanded state for properties
        const expandedState = {};
        propertiesData.forEach((property) => {
          expandedState[property._id] = false;
        });
        setExpandedProperties(expandedState);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const togglePropertyExpand = (propertyId) => {
    setExpandedProperties((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const showPopup = (message, type = "success") => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ ...popup, visible: false }), 3000);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      if (!currentUser?._id) {
        showPopup("Please sign in to modify bookings", "error");
        return;
      }

      if (!["confirmed", "cancelled"].includes(newStatus)) {
        throw new Error("Invalid status change");
      }

      const endpoint =
        newStatus === "confirmed"
          ? `confirm/${bookingId}`
          : `cancel/${bookingId}`;

      const response = await fetch(`/api/bookings/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        showPopup(`Booking ${newStatus} successfully!`);
      } else {
        throw new Error(data.message || `Failed to ${newStatus} booking`);
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  // Get bookings for each property, filtered by status
  const getPropertyBookings = (propertyId) => {
    return bookings
      .filter((booking) => booking.listing._id === propertyId)
      .filter(
        (booking) => statusFilter === "all" || booking.status === statusFilter
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Calculate days until expiration for pending bookings
  const getExpirationStatus = (expiresAt) => {
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffHours = Math.ceil((expiryDate - now) / (1000 * 60 * 60));

    if (diffHours <= 0) return "Expired";
    if (diffHours <= 24)
      return `Expires in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    const diffDays = Math.ceil(diffHours / 24);
    return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const StatusBadge = ({ status, expiresAt }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "confirmed":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "cancelled":
          return "bg-gray-50 text-gray-600 border-gray-200";
        case "pending":
        default:
          return "bg-white text-gray-700 border-gray-200";
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case "confirmed":
          return <CheckCircle className="h-3 w-3" />;
        case "cancelled":
          return <XCircle className="h-3 w-3" />;
        case "pending":
        default:
          return <Clock className="h-3 w-3" />;
      }
    };

    return (
      <div className="flex flex-col">
        <div
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getStatusStyles()}`}
        >
          {getStatusIcon()}
          <span>{status}</span>
        </div>
        {status === "pending" && expiresAt && (
          <span className="text-xs mt-1 text-gray-500">
            {getExpirationStatus(expiresAt)}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="text-lg font-medium text-gray-800 mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Count bookings by status
  const bookingCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  // Filter properties with bookings that match the current filter
  const filteredProperties = properties.filter((property) => {
    const propertyBookings = getPropertyBookings(property._id);
    return propertyBookings.length > 0;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Booking Requests
        </h1>
        <p className="text-gray-500">
          Manage booking requests for your {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setStatusFilter("all")}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
            statusFilter === "all"
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm text-gray-500">All Bookings</p>
            <p className="text-2xl font-light">{bookingCounts.all}</p>
          </div>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <div
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
            statusFilter === "pending"
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-light">{bookingCounts.pending}</p>
          </div>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div
          onClick={() => setStatusFilter("confirmed")}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
            statusFilter === "confirmed"
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-light">{bookingCounts.confirmed}</p>
          </div>
          <CheckCircle className="h-5 w-5 text-gray-400" />
        </div>
        <div
          onClick={() => setStatusFilter("cancelled")}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
            statusFilter === "cancelled"
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-light">{bookingCounts.cancelled}</p>
          </div>
          <XCircle className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-2">
            No {statusFilter !== "all" ? statusFilter : ""} bookings found
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-sm text-gray-600 underline"
            >
              View all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProperties.map((property) => {
            const propertyBookings = getPropertyBookings(property._id);

            return (
              <div
                key={property._id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => togglePropertyExpand(property._id)}
                >
                  <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-gray-400" />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {property.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {propertyBookings.length}{" "}
                        {propertyBookings.length === 1 ? "booking" : "bookings"}{" "}
                        • ${property.price.toLocaleString()}{" "}
                        {property.type === "rent" ? "/month" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {expandedProperties[property._id] ? "Collapse" : "Expand"}
                    </span>
                    {expandedProperties[property._id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedProperties[property._id] && (
                  <div className="divide-y divide-gray-100">
                    {propertyBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          <div className="md:col-span-3">
                            <div className="flex items-center gap-3">
                              {booking.user.avatar ? (
                                <img
                                  src={booking.user.avatar}
                                  alt={booking.user.fullname}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {booking.user.fullname}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.user.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.user.phone || "No phone provided"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">
                                {booking.bookingType === "Rent"
                                  ? "Rental Period"
                                  : "Purchase"}
                              </p>
                            </div>
                            {booking.bookingType === "Rent" ? (
                              <div className="ml-6">
                                <p className="text-sm text-gray-900">
                                  From{" "}
                                  {new Date(
                                    booking.startDate
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.durationDays} days
                                </p>
                              </div>
                            ) : (
                              <p className="ml-6 text-sm text-gray-900">
                                One-time purchase
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">
                                Amount
                              </p>
                            </div>
                            <p className="ml-6 text-sm text-gray-900">
                              ${booking.totalPrice.toLocaleString()}
                            </p>
                          </div>

                          <div className="md:col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">
                                Status
                              </p>
                            </div>
                            <div className="ml-6">
                              <StatusBadge
                                status={booking.status}
                                expiresAt={booking.expiresAt}
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2 flex justify-end items-center gap-2">
                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking._id, "confirmed")
                                  }
                                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking._id, "cancelled")
                                  }
                                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {booking.status !== "pending" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    booking._id,
                                    booking.status === "confirmed"
                                      ? "cancelled"
                                      : "confirmed"
                                  )
                                }
                                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {booking.status === "confirmed"
                                  ? "Cancel"
                                  : "Reconfirm"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Requested on
                                </p>
                                <p className="text-sm text-gray-700">
                                  {new Date(
                                    booking.createdAt
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    booking.createdAt
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Property Details
                                </p>
                                <p className="text-sm text-gray-700">
                                  {property.bedrooms} bed
                                  {property.bedrooms !== 1 ? "s" : ""},{" "}
                                  {property.bathrooms} bath
                                  {property.bathrooms !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="md:text-right">
                              <p className="text-xs text-gray-500">
                                Booking ID
                              </p>
                              <p className="text-sm font-mono text-gray-500">
                                {booking._id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {popup.visible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}
    </div>
  );
};

export default AgentBookings;
