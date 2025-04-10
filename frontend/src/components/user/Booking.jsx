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
import Popup from "../Popup";

const BookingForm = ({ property }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  const MINIMUM_BOOKING_DAYS = 30;
  const today = new Date();

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

  const isOwner = userId === property.userRef; // userRef is still the ID from getListing

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!userId) return;

      try {
        const response = await fetch("/api/bookings/check-booking", {
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

      const durationDays = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      if (durationDays < MINIMUM_BOOKING_DAYS) {
        throw new Error(`Minimum booking is ${MINIMUM_BOOKING_DAYS} day(s).`);
      }

      const bookingData = {
        user: userId,
        listing: property._id,
        bookingType: "Rent",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays,
        totalPrice: calculateTotalPrice(startDate, endDate),
      };

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

      const response = await fetch("/api/email/send", {
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
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          {property.rentOrSale === "Rent" ? "Book Now" : "Buy This Property"}
        </h3>
      </div>

      <div className="p-4">
        {isOwner ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <p className="ml-3 text-sm text-yellow-700">
                You are the owner of this property and cannot book it.
              </p>
            </div>
          </div>
        ) : hasExistingBooking ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">
                You have already booked this property!
              </p>
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
            {property.rentOrSale === "Rent" ? (
              <>
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
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
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
                        Rs{" "}
                        {calculateTotalPrice(
                          startDate,
                          endDate
                        ).toLocaleString()}
                      </span>
                    </div>
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
                    disabled={isBooking || !startDate || !endDate}
                    className={`flex-1 py-2 text-sm font-medium text-white rounded-md ${
                      isBooking
                        ? "bg-gray-400"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {isBooking ? (
                      "Processing..."
                    ) : (
                      <>
                        <Check className="inline mr-1 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {!showEmailForm ? (
                  <>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex justify-between font-medium text-sm">
                        <span>Sale Price:</span>
                        <span>Rs {property.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact the agent directly for more details.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setShowEmailForm(true)}
                        disabled={!agentEmail}
                        className={`py-2 text-sm font-medium rounded-md transition-colors ${
                          !agentEmail
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        <Mail className="inline mr-1 h-4 w-4" />
                        Send Mail
                      </button>
                      <a
                        href={`tel:${property.agent?.phone || "#"}`}
                        className="py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-center"
                      >
                        <Phone className="inline mr-1 h-4 w-4" />
                        Call
                      </a>
                      <button
                        onClick={() =>
                          showPopup("SMS feature coming soon!", "info")
                        }
                        className="py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        <MessageSquare className="inline mr-1 h-4 w-4" />
                        Send Message
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                        placeholder="Enter email subject"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                        rows="4"
                        placeholder="Enter your message"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <X className="inline mr-1 h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending || !agentEmail}
                        className={`flex-1 py-2 text-sm font-medium text-white rounded-md ${
                          emailSending || !agentEmail
                            ? "bg-gray-400"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        {emailSending ? (
                          "Sending..."
                        ) : (
                          <>
                            <Mail className="inline mr-1 h-4 w-4" />
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
