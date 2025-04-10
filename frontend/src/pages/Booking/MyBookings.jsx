import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Hourglass,
  AlertTriangle,
} from "lucide-react";
import Popup from "../../components/Popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MyBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [editPopup, setEditPopup] = useState({ visible: false, booking: null });
  const [cancelPopup, setCancelPopup] = useState({
    visible: false,
    bookingId: null,
  });
  const navigate = useNavigate();

  // Edit form states
  const [editStartDate, setEditStartDate] = useState(null);
  const [editEndDate, setEditEndDate] = useState(null);
  const [editTotalPrice, setEditTotalPrice] = useState(0);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?._id) {
        setError("Please sign in to view your bookings");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings/my-bookings/${currentUser._id}`
        );
        const data = await response.json();
        if (response.ok) {
          const now = new Date();
          const updatedBookings = data.map((booking) => {
            if (
              booking.status === "pending" &&
              booking.expiresAt &&
              new Date(booking.expiresAt) < now
            ) {
              return { ...booking, status: "expired" };
            }
            return booking;
          });
          setBookings(updatedBookings);
        } else {
          throw new Error(data.message || "Failed to fetch bookings");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Categorize bookings
  const activeBookings = bookings.filter(
    (booking) =>
      ["pending", "confirmed"].includes(booking.status) &&
      !(
        booking.status === "pending" &&
        booking.expiresAt &&
        new Date(booking.expiresAt) < new Date()
      ) &&
      booking.status !== "property_deleted"
  );

  const pendingExpiredBookings = bookings.filter(
    (booking) =>
      (booking.status === "pending" &&
        booking.expiresAt &&
        new Date(booking.expiresAt) < new Date()) ||
      booking.status === "expired"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  const deletedPropertyBookings = bookings.filter(
    (booking) => booking.status === "property_deleted"
  );

  const showPopup = (message, type = "success") => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ ...popup, visible: false }), 3000);
  };

  const handleCancelBooking = async () => {
    if (!cancelPopup.bookingId) return;

    try {
      const response = await fetch(
        `/api/bookings/cancel-guest/${cancelPopup.bookingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === cancelPopup.bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
        showPopup("Booking cancelled successfully!");
      } else {
        throw new Error(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setCancelPopup({ visible: false, bookingId: null });
    }
  };

  const handleEditBooking = (booking) => {
    setEditPopup({ visible: true, booking });
    setEditStartDate(booking.startDate ? new Date(booking.startDate) : null);
    setEditEndDate(booking.endDate ? new Date(booking.endDate) : null);
    setEditTotalPrice(booking.totalPrice || 0);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const response = await fetch(
        `/api/bookings/edit/${editPopup.booking._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser._id,
            startDate: editStartDate?.toISOString(),
            endDate: editEndDate?.toISOString(),
            durationDays:
              editStartDate && editEndDate
                ? Math.ceil(
                    (editEndDate - editStartDate) / (1000 * 60 * 60 * 24)
                  )
                : null,
            totalPrice: editTotalPrice,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === editPopup.booking._id
              ? {
                  ...booking,
                  startDate: editStartDate,
                  endDate: editEndDate,
                  totalPrice: editTotalPrice,
                }
              : booking
          )
        );
        showPopup("Booking updated successfully!");
        setEditPopup({ visible: false, booking: null });
      } else {
        throw new Error(data.message || "Failed to update booking");
      }
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditPopup = () => {
    setEditPopup({ visible: false, booking: null });
  };

  const renderBookingCard = (booking) => (
    <div
      key={booking._id}
      className={`bg-white border rounded-lg overflow-hidden transition-colors ${
        booking.status === "property_deleted"
          ? "border-red-200 bg-red-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-medium text-gray-900">
            {booking.listing?.title || "Property No Longer Available"}
          </h2>
          <div className="flex items-center">
            <span
              className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : booking.status === "property_deleted"
                  ? "bg-red-100 text-red-800"
                  : booking.expiresAt &&
                    new Date(booking.expiresAt) < new Date()
                  ? "bg-orange-100 text-orange-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {booking.status === "pending" &&
              booking.expiresAt &&
              new Date(booking.expiresAt) < new Date()
                ? "expired"
                : booking.status === "property_deleted"
                ? "property deleted"
                : booking.status}
            </span>
            {booking.status === "pending" && booking.expiresAt && (
              <span className="ml-2 text-xs text-gray-500">
                {new Date(booking.expiresAt) > new Date()
                  ? `Expires in ${Math.ceil(
                      (new Date(booking.expiresAt) - new Date()) /
                        (1000 * 60 * 60)
                    )} hours`
                  : "Expired"}
              </span>
            )}
          </div>
        </div>

        {booking.status === "property_deleted" ? (
          <div className="flex items-start mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-600">
              The property associated with this booking has been removed by the
              owner. Please contact support if you need assistance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Booking Type</p>
              <p className="font-medium">{booking.bookingType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-medium">
                ${booking.totalPrice.toLocaleString()}
              </p>
            </div>
            {booking.bookingType === "Rent" && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {booking.startDate
                      ? new Date(booking.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {booking.endDate
                      ? new Date(booking.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{booking.durationDays} days</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {booking.status === "pending" &&
            (!booking.expiresAt ||
              new Date(booking.expiresAt) > new Date()) && (
              <>
                <button
                  onClick={() => handleEditBooking(booking)}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit2 className="mr-1 h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() =>
                    setCancelPopup({ visible: true, bookingId: booking._id })
                  }
                  className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Cancel
                </button>
              </>
            )}
          {booking.listing?._id && (
            <button
              onClick={() => navigate(`/property/${booking.listing._id}`)}
              className="flex items-center text-gray-800 font-medium hover:text-gray-600 transition-colors"
            >
              View property <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-500">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-2">You have no bookings yet</p>
          <button
            onClick={() => navigate("/listings")}
            className="text-gray-800 font-medium hover:text-gray-600 transition-colors"
          >
            Browse properties →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Bookings Section */}
          {activeBookings.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-xl font-medium">Active Bookings</h2>
                <span className="ml-2 text-sm text-gray-500">
                  {activeBookings.length}
                </span>
              </div>
              <div className="space-y-4">
                {activeBookings.map(renderBookingCard)}
              </div>
            </div>
          )}

          {/* Pending Expired Bookings Section */}
          {pendingExpiredBookings.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Hourglass className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-xl font-medium">Expired Bookings</h2>
                <span className="ml-2 text-sm text-gray-500">
                  {pendingExpiredBookings.length}
                </span>
              </div>
              <div className="space-y-4">
                {pendingExpiredBookings.map(renderBookingCard)}
              </div>
            </div>
          )}

          {/* Deleted Property Bookings Section */}
          {deletedPropertyBookings.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h2 className="text-xl font-medium">Unavailable Properties</h2>
                <span className="ml-2 text-sm text-gray-500">
                  {deletedPropertyBookings.length}
                </span>
              </div>
              <div className="space-y-4">
                {deletedPropertyBookings.map(renderBookingCard)}
              </div>
            </div>
          )}

          {/* Cancelled Bookings Section */}
          {cancelledBookings.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <h2 className="text-xl font-medium">Cancelled Bookings</h2>
                <span className="ml-2 text-sm text-gray-500">
                  {cancelledBookings.length}
                </span>
              </div>
              <div className="space-y-4">
                {cancelledBookings.map(renderBookingCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Popup */}
      {cancelPopup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-medium mb-4">Cancel Booking</h2>
            <p className="mb-6">
              Are you sure you want to cancel this booking?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setCancelPopup({ visible: false, bookingId: null })
                }
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Popup */}
      {editPopup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-gray-900 rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={closeEditPopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-medium mb-4">Edit Booking</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editPopup.booking.bookingType === "Rent" && (
                <>
                  <div>
                    <label className="block text-sm font-medium">
                      Start Date
                    </label>
                    <DatePicker
                      selected={editStartDate}
                      onChange={(date) => setEditStartDate(date)}
                      minDate={new Date()}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      End Date
                    </label>
                    <DatePicker
                      selected={editEndDate}
                      onChange={(date) => setEditEndDate(date)}
                      minDate={editStartDate || new Date()}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium">Total Price</label>
                <input
                  type="number"
                  value={editTotalPrice}
                  readOnly
                  className="w-full p-2 border rounded cursor-not-allowed bg-gray-100"
                  min="0"
                />
              </div>
              <button
                type="submit"
                disabled={editLoading}
                className={`w-full py-2 text-white rounded ${
                  editLoading ? "bg-gray-400" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
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

export default MyBookings;
