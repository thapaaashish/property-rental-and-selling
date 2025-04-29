import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Verifying your payment..."
  );
  const [statusType, setStatusType] = useState("info");

  const verifyPayment = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get("pidx");
    const purchaseOrderId = params.get("purchase_order_id");

    if (!pidx) {
      setStatusMessage("Missing payment identifier (pidx).");
      setStatusType("error");
      return;
    }

    if (verifyingPayment) return;

    setVerifyingPayment(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/payment/verify`,
        { pidx, purchaseOrderId },
        { withCredentials: true }
      );

      if (response.data.success && response.data.bookingId) {
        setStatusMessage("Payment successful! Booking confirmed.");
        setStatusType("success");

        setTimeout(() => {
          navigate("/my-bookings", { replace: true });
        }, 2000);
      } else {
        setStatusMessage(
          response.data.message || "Payment verification failed."
        );
        setStatusType("error");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setStatusMessage(
        err.response?.data?.message ||
          "Payment verification failed. Please try again."
      );
      setStatusType("error");
    } finally {
      setVerifyingPayment(false);
    }
  }, [location.search, navigate, verifyingPayment]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Payment Status
          </h1>
        </div>
        <div className="p-6">
          {verifyingPayment ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
          ) : (
            <div
              className={`flex items-center p-4 rounded-md transition-all duration-200 ${
                statusType === "success"
                  ? "bg-green-100 text-green-700"
                  : statusType === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
              aria-live="polite"
            >
              <span className="mr-3">
                {statusType === "success" ? (
                  <CheckCircle2 size={24} />
                ) : statusType === "error" ? (
                  <XCircle size={24} />
                ) : (
                  <Info size={24} />
                )}
              </span>
              <span className="text-sm text-current">{statusMessage}</span>
            </div>
          )}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={verifyingPayment}
            >
              Go to Homepage
            </button>
            {statusType === "error" && (
              <button
                onClick={() => verifyPayment()}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={verifyingPayment}
              >
                Retry Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
