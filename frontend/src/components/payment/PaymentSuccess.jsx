import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Verifying your payment..."
  );
  const [statusType, setStatusType] = useState("info"); // "success", "error", "info"

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const pidx = params.get("pidx");
      const purchaseOrderId = params.get("purchase_order_id");

      if (!pidx) {
        setStatusMessage("❌ Missing payment identifier (pidx).");
        setStatusType("error");
        return;
      }

      // Make sure we don't re-verify
      if (verifyingPayment) return;

      setVerifyingPayment(true);

      try {
        const response = await axios.post(
          "/api/payment/verify",
          { pidx, purchaseOrderId },
          { withCredentials: true }
        );

        if (response.data.success && response.data.bookingId) {
          setStatusMessage("✅ Payment successful! Booking confirmed.");
          setStatusType("success");

          setTimeout(() => {
            navigate("/my-bookings", { replace: true });
          }, 2000);
        } else {
          setStatusMessage(
            response.data.message || "❌ Payment verification failed."
          );
          setStatusType("error");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatusMessage(
          err.response?.data?.message ||
            "❌ Payment verification failed. Please try again."
        );
        setStatusType("error");
      } finally {
        setVerifyingPayment(false);
      }
    };

    verifyPayment();
  }, [location.search, navigate]); // ✅ don't include verifyingPayment

  return (
    <div className="p-6 text-center max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Payment Status</h1>
      <div
        className={`p-4 rounded text-lg ${
          statusType === "success"
            ? "text-green-700 bg-green-100"
            : statusType === "error"
            ? "text-red-700 bg-red-100"
            : "text-gray-700 bg-gray-100"
        }`}
      >
        {statusMessage}
      </div>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default Success;
