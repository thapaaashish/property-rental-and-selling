import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, XCircle } from "lucide-react";

const KycVerification = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null); // Track userId for modal
  const [rejectReason, setRejectReason] = useState("");
  const [modalError, setModalError] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" }); // Success/error notification

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/"); // Redirect non-admins to homepage
    }
  }, [currentUser, navigate]);

  // Fetch pending KYC requests
  useEffect(() => {
    const fetchPendingKyc = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/kyc/pending", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPendingRequests(data.users);
        } else {
          setError(data.message || "Failed to fetch pending KYC requests");
        }
      } catch (err) {
        setError("An error occurred while fetching KYC requests");
        console.error("Error fetching KYC requests:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.role === "admin") {
      fetchPendingKyc();
    }
  }, [currentUser]);

  // Handle KYC verification (approve or reject)
  const handleVerifyKyc = async (userId, status, rejectedReason = "") => {
    setProcessing((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
        body: JSON.stringify({ userId, status, rejectedReason }),
      });
      const data = await response.json();
      if (data.success) {
        setPendingRequests((prev) =>
          prev.filter((user) => user._id !== userId)
        );
        setNotification({
          message: `KYC ${status} successfully`,
          type: "success",
        });
        setTimeout(() => setNotification({ message: "", type: "" }), 3000); // Auto-hide after 3s
      } else {
        setError(data.message || `Failed to ${status} KYC`);
        console.error("KYC verification error:", data);
      }
    } catch (err) {
      setError("An error occurred while processing the KYC request");
      console.error("Error processing KYC:", err);
    } finally {
      setProcessing((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle reject modal submission
  const handleRejectSubmit = (userId) => {
    if (!rejectReason.trim()) {
      setModalError("Rejection reason cannot be empty");
      return;
    }
    handleVerifyKyc(userId, "rejected", rejectReason);
    setShowRejectModal(null);
    setRejectReason("");
    setModalError(null);
  };

  // Handle reject modal cancellation
  const handleRejectCancel = () => {
    setShowRejectModal(null);
    setRejectReason("");
    setModalError(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          KYC Verification Dashboard
        </h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              notification.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {notification.message}
          </div>
        )}
        {loading ? (
          <p className="text-gray-600">Loading pending KYC requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-600">No pending KYC requests</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending KYC Requests ({pendingRequests.length})
              </h2>
              <ul className="divide-y divide-gray-200">
                {pendingRequests.map((user) => (
                  <li key={user._id} className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-teal-500 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.fullname || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Email: {user.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Document Type:{" "}
                            {(user.kyc?.documentType || "N/A").toUpperCase()}
                          </p>
                          <a
                            href={user.kyc?.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleVerifyKyc(user._id, "verified")}
                          disabled={processing[user._id]}
                          className={`flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ${
                            processing[user._id]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(user._id)}
                          disabled={processing[user._id]}
                          className={`flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${
                            processing[user._id]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {showRejectModal && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Enter Rejection Reason
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection"
                className="w-full p-2 border border-gray-300 rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {modalError && (
                <p className="mt-2 text-sm text-red-600">{modalError}</p>
              )}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handleRejectCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectSubmit(showRejectModal)}
                  disabled={!rejectReason.trim()}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                    !rejectReason.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycVerification;
