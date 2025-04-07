import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BookingForm = ({ property }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user); // Get currentUser from Redux
  const userId = currentUser?._id; // Extract userId

  // Booking state
  const MINIMUM_BOOKING_DAYS = 1;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const calculateTotalPrice = (start, end, pricePerMonth) => {
    if (property.rentOrSale === "Sale") return pricePerMonth;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerDay = pricePerMonth / 30;
    const effectiveDays = Math.max(days, MINIMUM_BOOKING_DAYS);
    return Math.round(effectiveDays * pricePerDay);
  };

  const handleBooking = async () => {
    try {
      setIsBooking(true);
      setBookingStatus(null);

      if (!property || !property._id) {
        throw new Error("Property data is missing or invalid");
      }

      if (!userId) {
        throw new Error("Please login to book this property");
      }

      let durationDays, totalPrice;
      if (property.rentOrSale === "Rent") {
        const start = new Date(startDate);
        const end = new Date(endDate);
        durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (durationDays < MINIMUM_BOOKING_DAYS) {
          throw new Error(
            `Minimum booking duration is ${MINIMUM_BOOKING_DAYS} days`
          );
        }
        const pricePerDay = property.price / 30;
        totalPrice = Math.round(durationDays * pricePerDay);
      } else {
        totalPrice = property.price;
      }

      const payload = {
        user: userId,
        listing: property._id,
        bookingType: property.rentOrSale,
        startDate: property.rentOrSale === "Rent" ? startDate : undefined,
        endDate: property.rentOrSale === "Rent" ? endDate : undefined,
        durationDays: property.rentOrSale === "Rent" ? durationDays : undefined,
        totalPrice,
      };
      console.log("Sending payload:", payload);

      const response = await fetch("/api/bookings/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Booking request status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.message || "Booking failed");
      }

      const data = await response.json();
      setBookingStatus({ success: true, message: "Booking successful!" });
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err) {
      console.error("Booking error:", err.message);
      setBookingStatus({
        success: false,
        message: err.message || "Booking error",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4 mt-8">
      <h3 className="text-lg font-semibold text-gray-900">
        {property.rentOrSale === "Rent"
          ? "Book This Property"
          : "Schedule Viewing"}
      </h3>

      {property.rentOrSale === "Rent" ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum stay: {MINIMUM_BOOKING_DAYS} days
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!startDate}
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                Duration:{" "}
                {Math.ceil(
                  (new Date(endDate) - new Date(startDate)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
                {Math.ceil(
                  (new Date(endDate) - new Date(startDate)) /
                    (1000 * 60 * 60 * 24)
                ) < MINIMUM_BOOKING_DAYS && (
                  <span className="block text-red-500 text-xs mt-1">
                    Minimum booking is {MINIMUM_BOOKING_DAYS} days
                  </span>
                )}
              </p>
              <p className="font-semibold mt-1">
                Total: $
                {calculateTotalPrice(
                  new Date(startDate),
                  new Date(endDate),
                  property.price
                ).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          Interested in this property? Contact the agent to schedule a viewing.
        </p>
      )}

      <button
        onClick={handleBooking}
        disabled={
          isBooking ||
          (property.rentOrSale === "Rent" && (!startDate || !endDate))
        }
        className={`w-full py-3 rounded-md font-semibold ${
          isBooking ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isBooking
          ? "Processing..."
          : property.rentOrSale === "Rent"
          ? "Book Now"
          : "Contact Agent"}
      </button>

      {bookingStatus && (
        <div
          className={`p-3 rounded-md ${
            bookingStatus.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <p className="text-sm">{bookingStatus.message}</p>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
