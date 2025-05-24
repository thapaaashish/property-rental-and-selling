import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Eye, Trash2, Search } from "lucide-react";
import axios from "axios";
import Popup from "../common/Popup";
import DeleteConfirmation from "../common/DeleteConfirmation";
import RefreshButton from "../common/RefreshButton";

const API_BASE = import.meta.env.VITE_API_URL;

const BookingsTab = ({
  bookings = [],
  navigate,
  actionLoading,
  currentUser,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [localBookings, setLocalBookings] = useState(bookings);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is authenticated
  const isAuthenticated = () => !!currentUser?.refreshToken;

  // Sync bookings prop
  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  // Fetch bookings
  const fetchBookings = async () => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to view bookings");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
        withCredentials: true,
      });
      const fetchedBookings = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || [];
      setLocalBookings(fetchedBookings);
      setPopupMessage("Bookings refreshed successfully");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to refresh bookings"
        );
        setPopupType("error");
        setShowPopup(true);
      }
    }
  };

  // Initial fetch if no bookings and authenticated
  useEffect(() => {
    if (!bookings.length && !localBookings.length && isAuthenticated()) {
      fetchBookings();
    }
  }, [bookings, localBookings.length, currentUser]);

  // Filter bookings by search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm) return localBookings;
    return localBookings.filter(
      (booking) =>
        booking.listing?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localBookings, searchTerm]);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const handleDeleteBooking = async (bookingId) => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to perform this action");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE}/api/admin/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to cancel booking");
      }
      setLocalBookings(
        localBookings.filter((booking) => booking._id !== bookingId)
      );
      setPopupMessage("Booking cancelled successfully!");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error deleting booking:", error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to cancel booking"
        );
        setPopupType("error");
        setShowPopup(true);
      }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by listing or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <RefreshButton
            onRefresh={fetchBookings}
            disabled={actionLoading || !isAuthenticated()}
          />
        </div>
      </div>
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Bookings Found
          </h3>
          <p className="text-gray-600 mb-4">
            {isAuthenticated()
              ? searchTerm
                ? "No bookings match your search criteria."
                : "There are no bookings in the system yet."
              : "Please log in to view bookings."}
          </p>
          <button
            onClick={() => navigate("/properties")}
            className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400 transition duration-150"
          >
            View Properties
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="py-3 px- easement-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {/* <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                      {booking.listing?.title || "Unknown Listing"}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {booking.status || "Pending"}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {booking.user?.fullname || "Unknown User"}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {booking.user?.email || "No email"}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : booking.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {booking.totalPrice ? `$${booking.totalPrice}` : "N/A"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {formatDate(booking.createdAt)}
                  </td>
                  {/* <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <DeleteConfirmation
                        itemName="booking"
                        onDelete={() => handleDeleteBooking(booking._id)}
                        disabled={actionLoading}
                      />
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
