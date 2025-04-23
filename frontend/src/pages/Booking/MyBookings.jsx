import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Popup from "../../components/common/Popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentButton from "../../components/payment/PaymentButton";
import StartChatButton from "../../components/StartChatButton";

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
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    expired: true,
    unavailable: true,
    cancelled: true,
  });
  const navigate = useNavigate();

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
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
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
        booking.status === "property_deleted"
          ? "border-l-4 border-red-500"
          : booking.status === "confirmed"
          ? "border-l-4 border-green-500"
          : booking.status === "pending"
          ? "border-l-4 border-yellow-500"
          : "border-l-4 border-gray-300"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {booking.listing?.title || "Property No Longer Available"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Booking ID: {booking._id}
            </p>
          </div>
          <div className="flex items-center">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
          </div>
        </div>

        {booking.status === "property_deleted" ? (
          <div className="flex items-start p-3 bg-red-50 rounded-lg mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-600">
              The property associated with this booking has been removed by the
              owner. Please contact support if you need assistance.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Type
                </p>
                <p className="font-medium mt-1">{booking.bookingType}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </p>
                <p className="font-medium mt-1">
                  Rs {booking.totalPrice.toLocaleString()}
                </p>
              </div>
              {booking.bookingType === "Rent" && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </p>
                    <p className="font-medium mt-1">
                      {booking.startDate
                        ? new Date(booking.startDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </p>
                    <p className="font-medium mt-1">
                      {booking.endDate
                        ? new Date(booking.endDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="font-medium mt-1">
                      {booking.durationDays} days
                    </p>
                  </div>
                </>
              )}
            </div>

            {booking.status === "confirmed" && booking.listing?.userRef && (
              <div className="mb-4">
                <StartChatButton
                  receiverId={booking.listing.userRef}
                  buttonText="Message Property Owner"
                  className="w-full md:w-auto"
                />
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Payment Status:
                    </span>
                    <span
                      className={`ml-2 font-medium ${
                        booking.paymentStatus === "paid"
                          ? "text-green-600"
                          : booking.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.paymentStatus || "pending"}
                    </span>
                    {booking.paymentStatus === "failed" && (
                      <div className="text-red-600 text-sm mt-1">
                        Payment failed. Please try again or contact support.
                      </div>
                    )}
                  </div>
                  <PaymentButton
                    booking={booking}
                    onPaymentSuccess={fetchBookings}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          {booking.status === "pending" &&
            (!booking.expiresAt ||
              new Date(booking.expiresAt) > new Date()) && (
              <>
                <button
                  onClick={() => handleEditBooking(booking)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() =>
                    setCancelPopup({ visible: true, bookingId: booking._id })
                  }
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Cancel
                </button>
              </>
            )}
          {booking.listing?._id && (
            <button
              onClick={() => navigate(`/property/${booking.listing._id}`)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-800 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Property <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-sm">
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/listings")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Explore Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-500">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} in
          total
        </p>
      </div>

      {verifyingPayment && (
        <div className="flex justify-center items-center mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-blue-700 font-medium">
            Verifying payment...
          </span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Hourglass className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't made any bookings yet. Start exploring our properties to
            find your perfect stay.
          </p>
          <button
            onClick={() => navigate("/listings")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("active")}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <h2 className="text-xl font-semibold">Active Bookings</h2>
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {activeBookings.length}
                  </span>
                </div>
                {expandedSections.active ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.active && (
                <div className="px-6 pb-6 space-y-4">
                  {activeBookings.map(renderBookingCard)}
                </div>
              )}
            </div>
          )}

          {pendingExpiredBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("expired")}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Hourglass className="h-6 w-6 text-orange-500 mr-3" />
                  <h2 className="text-xl font-semibold">Expired Bookings</h2>
                  <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                    {pendingExpiredBookings.length}
                  </span>
                </div>
                {expandedSections.expired ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.expired && (
                <div className="px-6 pb-6 space-y-4">
                  {pendingExpiredBookings.map(renderBookingCard)}
                </div>
              )}
            </div>
          )}

          {deletedPropertyBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("unavailable")}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                  <h2 className="text-xl font-semibold">
                    Unavailable Properties
                  </h2>
                  <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    {deletedPropertyBookings.length}
                  </span>
                </div>
                {expandedSections.unavailable ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.unavailable && (
                <div className="px-6 pb-6 space-y-4">
                  {deletedPropertyBookings.map(renderBookingCard)}
                </div>
              )}
            </div>
          )}

          {cancelledBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("cancelled")}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 text-gray-500 mr-3" />
                  <h2 className="text-xl font-semibold">Cancelled Bookings</h2>
                  <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {cancelledBookings.length}
                  </span>
                </div>
                {expandedSections.cancelled ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.cancelled && (
                <div className="px-6 pb-6 space-y-4">
                  {cancelledBookings.map(renderBookingCard)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popup Modals */}
      {cancelPopup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cancel Booking</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setCancelPopup({ visible: false, bookingId: null })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPopup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full relative">
            <button
              onClick={closeEditPopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Booking</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editPopup.booking.bookingType === "Rent" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <DatePicker
                        selected={editStartDate}
                        onChange={(date) => setEditStartDate(date)}
                        minDate={new Date()}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <DatePicker
                        selected={editEndDate}
                        onChange={(date) => setEditEndDate(date)}
                        minDate={editStartDate || new Date()}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <input
                    type="number"
                    value={editTotalPrice}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    min="0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`w-full py-3 text-white rounded-lg font-medium ${
                    editLoading
                      ? "bg-teal-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  {editLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
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
