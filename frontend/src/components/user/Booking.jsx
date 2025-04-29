import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calendar,
  X,
  Check,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Popup from "../common/Popup";
import StartChatButton from "../StartChatButton";
import { generateRoomId } from "../../utils/roomId";

const API_BASE = import.meta.env.VITE_API_URL;

const BookingForm = ({ property }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  const MINIMUM_BOOKING_DAYS = 30;
  const MINIMUM_START_DAYS = 7;
  const today = new Date();
  const minimumStartDate = new Date(today);
  minimumStartDate.setDate(today.getDate() + MINIMUM_START_DAYS);

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [agentEmail, setAgentEmail] = useState(property.agent?.email || null);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [hasExistingBooking, setHasExistingBooking] = useState(false);

  const isOwner = userId === property.userRef;

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE}/api/bookings/check-booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, propertyId: property._id }),
        });

        const data = await response.json();
        if (data.exists) setHasExistingBooking(true);
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
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerDay = property.price / 30;
    return Math.round(Math.max(days, MINIMUM_BOOKING_DAYS) * pricePerDay);
  };

  const getMinimumEndDate = () => {
    if (!startDate) return null;
    const minEndDate = new Date(startDate);
    minEndDate.setDate(startDate.getDate() + MINIMUM_BOOKING_DAYS);
    return minEndDate;
  };

  const isValidBookingDuration = () => {
    if (!startDate || !endDate) return false;
    const durationDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    return durationDays >= MINIMUM_BOOKING_DAYS;
  };

  const handleBooking = async () => {
    try {
      if (hasExistingBooking) {
        showPopup("You have already booked this property!", "error");
        return;
      }

      setIsBooking(true);

      if (!userId) throw new Error("Please login to proceed");
      if (isOwner) throw new Error("You cannot book your own property");

      if (property.rentOrSale !== "Rent") return;

      if (!isValidBookingDuration()) {
        throw new Error(`Minimum booking is ${MINIMUM_BOOKING_DAYS} days.`);
      }

      const bookingData = {
        user: userId,
        listing: property._id,
        bookingType: "Rent",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        totalPrice: calculateTotalPrice(startDate, endDate),
      };

      const response = await fetch(`${API_BASE}/api/bookings/create-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Booking failed");
      }

      showPopup("Booking requested!", "success");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setIsBooking(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!emailSubject || !emailMessage) {
        showPopup("Please fill in both subject and message.", "error");
        return;
      }

      if (!agentEmail) {
        showPopup("Agent email not available.", "error");
        return;
      }

      setEmailSending(true);

      const emailData = {
        to: agentEmail,
        subject: emailSubject,
        message: emailMessage,
        propertyTitle: property.title,
        propertyPrice: property.price,
        userName: currentUser.fullname || "User",
        userEmail: currentUser.email,
      };

      const response = await fetch(`${API_BASE}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.token && {
            Authorization: `Bearer ${currentUser.token}`,
          }),
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send email");
      }

      showPopup("Email sent successfully!", "success");
      setShowEmailForm(false);
      setEmailSubject("");
      setEmailMessage("");
    } catch (err) {
      showPopup(err.message || "Failed to send email", "error");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-gray-600" />
          {property.rentOrSale === "Rent"
            ? "Book This Property"
            : "Buy This Property"}
        </h3>
      </div>

      <div className="p-6">
        {isOwner ? (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="ml-3 text-sm text-amber-800">
                You cannot book your own property.
              </p>
            </div>
          </div>
        ) : hasExistingBooking ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="ml-3 text-sm text-red-800">
                You have already booked this property!
              </p>
            </div>
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isOwner || hasExistingBooking}
          >
            {property.rentOrSale === "Rent"
              ? "Check Availability"
              : "Contact Agent"}
          </button>
        ) : (
          <div className="space-y-6">
            {property.rentOrSale === "Rent" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label
                      htmlFor="start-date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <DatePicker
                        id="start-date"
                        selected={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                          if (endDate && endDate < getMinimumEndDate()) {
                            setEndDate(null);
                          }
                        }}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={minimumStartDate}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                        placeholderText="Select start date (min 7 days from today)"
                        aria-describedby="start-date-help"
                      />
                    </div>
                    <p
                      id="start-date-help"
                      className="mt-1 text-xs text-gray-500"
                    >
                      Must be at least 7 days from today.
                    </p>
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="end-date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <DatePicker
                        id="end-date"
                        selected={endDate}
                        onChange={setEndDate}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={getMinimumEndDate()}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                        disabled={!startDate}
                        placeholderText="Select end date"
                        aria-describedby="end-date-help"
                      />
                    </div>
                    <p
                      id="end-date-help"
                      className="mt-1 text-xs text-gray-500"
                    >
                      Must be at least 30 days from start date.
                    </p>
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 transition-all duration-300">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Duration</span>
                      <span>
                        {Math.ceil(
                          (endDate - startDate) / (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-gray-900 mt-2">
                      <span>Total</span>
                      <span>
                        Rs{" "}
                        {calculateTotalPrice(
                          startDate,
                          endDate
                        ).toLocaleString()}
                      </span>
                    </div>
                    {!isValidBookingDuration() && (
                      <p className="mt-2 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Booking must be at least {MINIMUM_BOOKING_DAYS} days.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 px-4 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <X className="inline mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={
                      isBooking ||
                      !startDate ||
                      !endDate ||
                      !isValidBookingDuration()
                    }
                    className={`flex-1 py-3 px-4 text-sm font-semibold text-white rounded-lg transition-all ${
                      isBooking ||
                      !startDate ||
                      !endDate ||
                      !isValidBookingDuration()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
                    }`}
                    aria-label="Confirm booking"
                  >
                    {isBooking ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Check className="inline mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {!showEmailForm ? (
                  <>
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                      <div className="flex justify-between text-base font-semibold text-gray-900">
                        <span>Sale Price</span>
                        <span>Rs {property.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Contact the agent for more details.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => setShowEmailForm(true)}
                        disabled={!agentEmail}
                        className={`py-3 px-4 text-sm font-semibold rounded-lg transition-all ${
                          !agentEmail
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black"
                        }`}
                        aria-label="Send email to agent"
                      >
                        <Mail className="inline mr-2 h-4 w-4" />
                        Send Mail
                      </button>
                      <a
                        href={`tel:${property.agent?.phone || "#"}`}
                        className="py-3 px-4 text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all text-center"
                        aria-label="Call agent"
                      >
                        <Phone className="inline mr-2 h-4 w-4" />
                        Call
                      </a>
                      <StartChatButton
                        receiverId={property.userRef}
                        receiverEmail={agentEmail}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email-subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subject
                      </label>
                      <input
                        id="email-subject"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                        placeholder="Enter email subject"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email-message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message
                      </label>
                      <textarea
                        id="email-message"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                        rows="4"
                        placeholder="Enter your message"
                        aria-required="true"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="flex-1 py-3 px-4 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        aria-label="Cancel email"
                      >
                        <X className="inline mr-2 h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending || !agentEmail}
                        className={`flex-1 py-3 px-4 text-sm font-semibold text-white rounded-lg transition-all ${
                          emailSending || !agentEmail
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
                        }`}
                        aria-label="Send email"
                      >
                        {emailSending ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                              />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <>
                            <Mail className="inline mr-2 h-4 w-4" />
                            Send Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
