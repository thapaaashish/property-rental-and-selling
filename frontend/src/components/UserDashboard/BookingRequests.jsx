import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Home,
  ChevronDown,
  ChevronUp,
  Filter,
  User,
  Loader2,
} from "lucide-react";
import Popup from "../common/Popup";

const API_BASE = import.meta.env.VITE_API_URL;

const BookingRequests = () => {
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
  const [processing, setProcessing] = useState({}); // Now stores action strings (e.g., "confirm", "cancel") or null

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?._id) {
        setError("Please sign in to view booking requests");
        setLoading(false);
        return;
      }

      try {
        const propertiesResponse = await fetch(
          `${API_BASE}/api/listings/user/${currentUser._id}`
        );
        const propertiesData = await propertiesResponse.json();
        if (!propertiesResponse.ok) {
          throw new Error(
            propertiesData.message || "Failed to fetch properties"
          );
        }
        setProperties(propertiesData);

        const listingIds = propertiesData.map((property) => property._id);
        const bookingsResponse = await fetch(
          `${API_BASE}/api/bookings/for-listings`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingIds }),
          }
        );
        const bookingsData = await bookingsResponse.json();
        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.message || "Failed to fetch bookings");
        }
        setBookings(bookingsData);

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
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const action = newStatus === "confirmed" ? "confirm" : "cancel";
    setProcessing((prev) => ({ ...prev, [bookingId]: action }));
    try {
      if (!currentUser?._id) {
        showPopup("Please sign in to modify bookings", "error");
        return;
      }

      const endpoint =
        newStatus === "confirmed"
          ? `confirm/${bookingId}`
          : `cancel/${bookingId}`;

      const response = await fetch(`${API_BASE}/api/bookings/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${newStatus} booking`);
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      const booking = bookings.find((b) => b._id === bookingId);
      if (newStatus === "confirmed") {
        setProperties((prev) =>
          prev.map((property) =>
            property._id === booking.listing._id
              ? {
                  ...property,
                  status: booking.bookingType === "Rent" ? "rented" : "sold",
                }
              : property
          )
        );
        showPopup("Booking confirmed and property status updated!");
      } else if (newStatus === "cancelled" && booking.status === "confirmed") {
        setProperties((prev) =>
          prev.map((property) =>
            property._id === booking.listing._id
              ? { ...property, status: "active" }
              : property
          )
        );
        showPopup("Booking cancelled and property status reverted to active!");
      } else {
        showPopup(`Booking ${newStatus} successfully!`);
      }
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setProcessing((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  const getPropertyBookings = (propertyId) => {
    return bookings
      .filter((booking) => booking.listing._id === propertyId)
      .filter(
        (booking) => statusFilter === "all" || booking.status === statusFilter
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

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

  const bookingCounts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings]
  );

  const filteredProperties = properties.filter((property) => {
    const propertyBookings = getPropertyBookings(property._id);
    return propertyBookings.length > 0;
  });

  const StatusBadge = ({ status, expiresAt }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "confirmed":
          return "bg-teal-100 text-teal-800 border-teal-200";
        case "cancelled":
          return "bg-red-100 text-red-800 border-red-200";
        case "pending":
        default:
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusStyles()}`}
        >
          {getStatusIcon()}
          <span className="capitalize">{status}</span>
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            aria-label="Retry loading bookings"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-teal-600" />
          Booking Requests
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage booking requests for your {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <button
          onClick={() => setStatusFilter("all")}
          className={`bg-white rounded-xl shadow-sm p-4 border ${
            statusFilter === "all"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-100 hover:bg-teal-50"
          } transition-colors cursor-pointer`}
          aria-label="Filter by all bookings"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">All Bookings</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookingCounts.all}
              </p>
            </div>
            <Filter className="h-5 w-5 text-teal-600" />
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`bg-white rounded-xl shadow-sm p-4 border ${
            statusFilter === "pending"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-100 hover:bg-teal-50"
          } transition-colors cursor-pointer`}
          aria-label="Filter by pending bookings"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookingCounts.pending}
              </p>
            </div>
            <Clock className="h-5 w-5 text-teal-600" />
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("confirmed")}
          className={`bg-white rounded-xl shadow-sm p-4 border ${
            statusFilter === "confirmed"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-100 hover:bg-teal-50"
          } transition-colors cursor-pointer`}
          aria-label="Filter by confirmed bookings"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookingCounts.confirmed}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-teal-600" />
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`bg-white rounded-xl shadow-sm p-4 border ${
            statusFilter === "cancelled"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-100 hover:bg-teal-50"
          } transition-colors cursor-pointer`}
          aria-label="Filter by cancelled bookings"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookingCounts.cancelled}
              </p>
            </div>
            <XCircle className="h-5 w-5 text-teal-600" />
          </div>
        </button>
      </div>

      {/* Properties and Bookings */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-teal-50 mb-4">
            <Home className="h-6 w-6 text-teal-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            No {statusFilter !== "all" ? statusFilter : ""} bookings found
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              aria-label="View all bookings"
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-teal-50 transition-colors"
                  onClick={() => togglePropertyExpand(property._id)}
                  aria-expanded={expandedProperties[property._id]}
                  aria-label={`Toggle details for ${property.title}`}
                >
                  <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-teal-600" />
                    <div className="text-left">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-[300px]">
                        {property.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {propertyBookings.length}{" "}
                        {propertyBookings.length === 1 ? "booking" : "bookings"}{" "}
                        • Rs. {property.price.toLocaleString()}{" "}
                        {property.rentOrSale === "Rent" ? "/month" : ""} •
                        Status: {property.status}
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
                </button>
                {expandedProperties[property._id] && (
                  <div className="divide-y divide-gray-100">
                    {propertyBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 sm:p-6 hover:bg-teal-50 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
                          <div className="md:col-span-3">
                            <div className="flex items-center gap-3">
                              {booking.user.avatar ? (
                                <img
                                  src={booking.user.avatar}
                                  alt={booking.user.fullname || "User avatar"}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                  onError={(e) =>
                                    (e.target.src =
                                      "https://via.placeholder.com/48?text=No+Image")
                                  }
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                  {booking.user.fullname || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {booking.user.email || "No email"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {booking.user.phone || "No phone provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-teal-600" />
                              <p className="text-sm font-medium text-gray-700">
                                {booking.bookingType === "Rent"
                                  ? "Rental Period"
                                  : "Purchase"}
                              </p>
                            </div>
                            <div className="ml-6">
                              {booking.bookingType === "Rent" ? (
                                <>
                                  <p className="text-sm text-gray-800">
                                    From{" "}
                                    {new Date(
                                      booking.startDate
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {booking.durationDays} days
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-800">
                                  One-time purchase
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              
                              <p className="text-sm font-medium text-gray-700">
                                Amount
                              </p>
                            </div>
                            <p className=" text-sm text-gray-800">
                              Rs. {booking.totalPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-teal-600" />
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
                                  className="flex items-center px-3 sm:px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-300"
                                  disabled={
                                    processing[booking._id] === "confirm"
                                  }
                                  aria-label="Confirm booking"
                                  title="Confirm booking"
                                >
                                  {processing[booking._id] === "confirm" ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Confirm"
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking._id, "cancelled")
                                  }
                                  className="flex items-center px-3 sm:px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:border-gray-200 disabled:text-gray-400"
                                  disabled={
                                    processing[booking._id] === "cancel"
                                  }
                                  aria-label="Reject booking"
                                  title="Reject booking"
                                >
                                  {processing[booking._id] === "cancel" ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Reject"
                                  )}
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
                                className="flex items-center px-3 sm:px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:border-gray-200 disabled:text-gray-400"
                                disabled={
                                  processing[booking._id] === "confirm" ||
                                  processing[booking._id] === "cancel"
                                }
                                aria-label={
                                  booking.status === "confirmed"
                                    ? "Cancel booking"
                                    : "Reconfirm booking"
                                }
                                title={
                                  booking.status === "confirmed"
                                    ? "Cancel booking"
                                    : "Reconfirm booking"
                                }
                              >
                                {processing[booking._id] === "confirm" ||
                                processing[booking._id] === "cancel" ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : booking.status === "confirmed" ? (
                                  "Cancel"
                                ) : (
                                  "Reconfirm"
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-teal-600" />
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
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-teal-600" />
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
                            <div className="sm:text-right">
                              <p className="text-xs text-gray-500">
                                Booking ID
                              </p>
                              <p className="text-sm font-mono text-gray-500 truncate">
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
          duration={3000}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}
    </div>
  );
};

export default BookingRequests;
