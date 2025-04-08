import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, X, Check, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Popup from "../components/Popup";

const BookingForm = ({ property }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  const MINIMUM_BOOKING_DAYS = 1;
  const today = new Date();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [hasExistingBooking, setHasExistingBooking] = useState(false); // New state to track existing bookings

  // Check if current user is the property owner
  const isOwner = userId === property.userRef;

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!userId) return; // If no user is logged in, don't check

      try {
        const response = await fetch("/api/bookings/check-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, propertyId: property._id }),
        });

        const data = await response.json();

        if (data.exists) {
          setHasExistingBooking(true); // User has an existing booking
        }
      } catch (error) {
        console.error("Error checking for existing booking:", error);
      }
    };

    checkExistingBooking();
  }, [userId, property._id]);

  const showPopup = (message, type = "success") => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ ...popup, visible: false }), 3000);
  };

  const calculateTotalPrice = (start, end) => {
    if (property.rentOrSale === "Sale") return property.price;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerDay = property.price / 30;
    return Math.round(Math.max(days, MINIMUM_BOOKING_DAYS) * pricePerDay);
  };

  const handleBooking = async () => {
    try {
      if (hasExistingBooking) {
        showPopup("You have already booked this property!", "error");
        return;
      }

      setIsBooking(true);

      if (!userId) throw new Error("Please login to book this property");
      if (isOwner) throw new Error("You cannot book your own property");

      let bookingData = {
        user: userId,
        listing: property._id,
        bookingType: property.rentOrSale,
        totalPrice: property.price,
      };

      if (property.rentOrSale === "Rent") {
        const durationDays = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );
        if (durationDays < MINIMUM_BOOKING_DAYS) {
          throw new Error(`Minimum booking is ${MINIMUM_BOOKING_DAYS} day(s).`);
        }

        bookingData = {
          ...bookingData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationDays,
          totalPrice: calculateTotalPrice(startDate, endDate),
        };
      }

      const response = await fetch("/api/bookings/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Booking failed");
      }

      showPopup("Booking successful!", "success");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          {property.rentOrSale === "Rent" ? "Book Now" : "Schedule Viewing"}
        </h3>
      </div>

      <div className="p-4">
        {isOwner ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are the owner of this property and cannot book it.
                </p>
              </div>
            </div>
          </div>
        ) : hasExistingBooking ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You have already booked this property!
                </p>
              </div>
            </div>
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-2.5 rounded-md font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm"
            disabled={isOwner || hasExistingBooking}
          >
            {property.rentOrSale === "Rent"
              ? "Check Availability"
              : "Contact Agent"}
          </button>
        ) : (
          <div className="space-y-4">
            {property.rentOrSale === "Rent" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={today}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || today}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      disabled={!startDate}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span>
                        {Math.ceil(
                          (endDate - startDate) / (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between font-medium mt-1">
                      <span>Total:</span>
                      <span>
                        $$
                        {calculateTotalPrice(
                          startDate,
                          endDate
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <X className="inline mr-1 h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={
                  isBooking ||
                  (property.rentOrSale === "Rent" && (!startDate || !endDate))
                }
                className={`flex-1 py-2 text-sm font-medium text-white rounded-md ${
                  isBooking ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {isBooking ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="inline mr-1 h-4 w-4" />
                    {property.rentOrSale === "Rent" ? "Confirm" : "Contact"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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

export default BookingForm;
