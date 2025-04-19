import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import Popup from "../components/common/Popup";

const SignIn = () => {
  const dispatch = useDispatch();
  const { loading, error, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      dispatch(signInFailure("Please fill in all fields"));
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      dispatch(signInFailure("Please enter a valid email address"));
      return;
    }

    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success === false) {
        let errorMessage = data.message || "Sign-in failed";
        if (errorMessage === "User not found") {
          errorMessage = "No account found with this email. Please sign up.";
        } else if (errorMessage === "Invalid credentials") {
          errorMessage = "Incorrect email or password. Please try again.";
        }
        dispatch(signInFailure(errorMessage));
        return;
      }

      dispatch(signInSuccess(data));
      navigate("/"); // Navigate immediately, no success popup
    } catch (error) {
      dispatch(signInFailure("Network error. Please try again."));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Close popup handler
  const handleClosePopup = () => {
    dispatch(signInFailure(null)); // Clear error
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 mt-[-60px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-semibold text-center mb-2">Login now</h2>
        <p className="text-center text-gray-600 mb-4">Hi, Welcome back 👋</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email id"
              className="w-full p-2 border rounded mt-1 focus:border-sky-500 focus:outline-sky-500 disabled:border-gray-200 disabled:bg-gray-50"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full p-2 border rounded mt-1 focus:outline-sky-500"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-2 rounded bg-teal-500 hover:bg-teal-400 disabled:bg-teal-300"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">
            Or Sign in with Google
          </span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <OAuth />

        <Link to="/sign-up">
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <span className="text-blue-500">Sign up</span>
          </p>
        </Link>

        {/* Popup for error messages only */}
        {error && (
          <Popup
            message={error}
            type="error"
            duration={5000} // 5 seconds for errors
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
};

export default SignIn;
