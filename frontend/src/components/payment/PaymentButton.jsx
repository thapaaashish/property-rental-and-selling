import { useState } from "react";
import axios from "axios";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import Popup from "../common/Popup";
import { useSelector } from "react-redux";

const PaymentButton = ({ booking, onPaymentSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  console.log("Booking:", booking);
  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/payment/initiate",
        {
          bookingId: booking._id,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={loading || booking.paymentStatus === "paid"}
        className={`flex items-center justify-center px-4 py-2 rounded-md ${
          loading
            ? "bg-gray-400 text-white"
            : booking.paymentStatus === "paid"
            ? "bg-green-100 text-green-800 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : booking.paymentStatus === "paid" ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Paid
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Khalti
          </>
        )}
      </button>

      {popup.visible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}
    </>
  );
};

export default PaymentButton;
