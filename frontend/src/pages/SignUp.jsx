import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import { useSelector } from "react-redux";
import Popup from "../components/common/Popup";
import PasswordInput from "../components/common/PasswordInputValidation";

const API_BASE = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // For success popups
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Flag to show OTP form
  const [otp, setOtp] = useState(""); // Store OTP input
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    hasError: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Form data state
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Submit signup form to store data temporarily and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      console.log("Signup response:", data);
      if (data.success === false) {
        setLoading(false);
        let errorMessage = data.message;
        if (errorMessage === "Email already registered") {
          errorMessage =
            "This email is already registered. Please use a different email or log in.";
        }
        setError(errorMessage);
        return;
      }
      setLoading(false);
      setError(null);
      setSuccessMessage(data.message || "OTP sent to your email!");
      setOtpSent(true); // Show OTP form
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      setError("Failed to send OTP. Please try again.");
    }
  };

  // Submit OTP for verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log("Submitting OTP:", { email: formData.email, otp });

      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("OTP verification response:", data);

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        // Reset formData, otp, and otpSent on failed OTP verification
        setFormData({
          fullname: "",
          email: "",
          password: "",
        });
        setOtp("");
        setOtpSent(false);
        return;
      }

      setLoading(false);
      setError(null);
      setSuccessMessage(data.message || "Account created successfully!");
      // Delay navigation to allow popup to be seen
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000); // Navigate after 2 seconds
    } catch (error) {
      console.error("OTP verification error:", error);
      setLoading(false);
      setError("Failed to verify OTP. Please try again.");
      // Reset formData, otp, and otpSent on error
      setFormData({
        fullname: "",
        email: "",
        password: "",
      });
      setOtp("");
      setOtpSent(false);
    }
  };

  // Close popup handler
  const handleClosePopup = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-[-60px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        <p className="text-center text-gray-600 mt-2">Hi, 👋</p>

        {/* Signup form */}
        {!otpSent ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <label className="block font-medium">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-md p-2 mt-1 focus:outline-sky-500"
              id="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />

            <label className="block font-medium mt-3">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-md p-2 mt-1 focus:outline-sky-500"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label className="block font-medium mt-3">Password</label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={handleChange}
              onValidationChange={setPasswordValidation}
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-md mt-4 hover:bg-teal-400"
              disabled={loading || !passwordValidation.isValid}
            >
              {loading ? "Loading..." : "Send OTP"}
            </button>

            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-500 text-sm">
                Or Sign Up with email
              </span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <OAuth />
          </form>
        ) : (
          // OTP Form
          <form
            onSubmit={handleOtpSubmit}
            className="mt-6 w-full max-w-md mx-auto"
          >
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter OTP
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 placeholder-gray-400"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-3 rounded-lg mt-4 hover:bg-teal-900 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full text-blue-700 mt-3 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-gray">
          Already have an Account?{" "}
          <Link
            to="/sign-in"
            className="text-blue-700 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>

        {/* Popup for success messages */}
        {successMessage && (
          <Popup
            message={successMessage}
            type="success"
            duration={3000}
            onClose={handleClosePopup}
          />
        )}
        {/* Popup for error messages */}
        {error && (
          <Popup
            message={error}
            type="error"
            duration={5000} // Longer duration for errors to ensure user reads
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
};

export default Signup;
