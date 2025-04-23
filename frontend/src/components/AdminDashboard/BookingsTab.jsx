import React, { useState } from "react";
import { Calendar, Eye, Trash2 } from "lucide-react";
import Popup from "../common/Popup";
import DeleteConfirmation from "../common/DeleteConfirmation";

const BookingsTab = ({ bookings = [], navigate, actionLoading }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [localBookings, setLocalBookings] = useState(bookings);

  // Sync bookings prop
  React.useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const handleDeleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || "Failed to cancel booking");
      }
      setLocalBookings(
        localBookings.filter((booking) => booking._id !== bookingId)
      );
      setPopupMessage("Booking cancelled successfully!");
      setPopupType("success");
      setShowPopup(true);
    } catch (err) {
      setPopupMessage(err.message || "Failed to cancel booking");
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
        <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
      </div>
      {localBookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no bookings in the system yet.
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
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {localBookings.map((booking) => (
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
