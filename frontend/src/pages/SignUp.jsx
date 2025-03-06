import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";

const Signup = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Flag to show OTP form
  const [otp, setOtp] = useState(""); // Store OTP input
  const navigate = useNavigate();

  // Ensure form fields are controlled
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      console.log("Signup response:", data); // Debug log
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      setOtpSent(true); // Show OTP form after successful signup
    } catch (error) {
      console.error("Signup error:", error); // Debug log
      setLoading(false);
      setError(error.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Submitting OTP:", { email: formData.email, otp }); // Debug log
      
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
        credentials: 'include',
      });
  
      const data = await res.json();
      console.log("OTP verification response:", data); // Debug log
      
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      
      setLoading(false);
      setError(null);
      alert(data.message || "OTP verified successfully!");
      navigate("/sign-in");
    } catch (error) {
      console.error("OTP verification error:", error); // Debug log
      setLoading(false);
      setError("An error occurred during OTP verification.");
    }
  };
  

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen  bg-gray-100 mt-[-60px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        <p className="text-center text-gray-600 mt-2">Hi, 👋</p>

        {/* Signup form */}
        {!otpSent ? (
          <form onSubmit={handleSubmit} className="mt-4">
            {/* Full Name */}
            <label className="block font-medium">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-md p-2 mt-1 focus:outline-sky-500"
              id="fullname"
              value={formData.fullname} // Ensure the value is always controlled
              onChange={handleChange}
              required
            />

            {/* Email */}
            <label className="block font-medium mt-3">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-md p-2 mt-1 focus:outline-sky-500"
              id="email"
              value={formData.email} // Ensure the value is always controlled
              onChange={handleChange}
              required
            />

            {/* Password */}
            <label className="block font-medium mt-3">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border rounded-md p-2 mt-1 pr-10 focus:outline-sky-500"
                id="password"
                value={formData.password} // Ensure the value is always controlled
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-md mt-4 hover:bg-teal-400"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign up"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-500 text-sm">Or Sign Up with email</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <OAuth />
            
          </form>
        ) : (
          // OTP Form
          <form onSubmit={handleOtpSubmit} className="mt-4">
            <label className="block font-medium">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border rounded-md p-2 mt-1"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-pink-700 text-white py-2 rounded-md mt-4 hover:bg-pink-900"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* Already have an account */}
        <p className="text-center mt-4 text-gray">
          Already have an Account?{" "}
          <Link to="/sign-in" className="text-blue-700 font-semibold hover:underline">
            Log In
          </Link>
        </p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Signup;
