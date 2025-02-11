import React, { useState } from "react";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom'

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        <p className="text-center text-gray-600 mt-2">Hi, 👋</p>

        <form className="mt-4">
          {/* First Name */}
          <label className="block font-medium">First Name</label>
          <input
            type="text"
            placeholder="First Name"
            className="w-full border rounded-md p-2 mt-1"
          />

          {/* Last Name */}
          <label className="block font-medium mt-3">Last Name</label>
          <input
            type="text"
            placeholder="Last Name"
            className="w-full border rounded-md p-2 mt-1"
          />

          {/* Email */}
          <label className="block font-medium mt-3">Email</label>
          <input
            type="email"
            placeholder="Enter your email id"
            className="w-full border rounded-md p-2 mt-1"
          />

          {/* Password */}
          <label className="block font-medium mt-3">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border rounded-md p-2 mt-1 pr-10"
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
          <button className="w-full bg-#d90965 text-white py-2 rounded-md mt-4 bg-pink-700 hover:bg-pink-900">
            Sign up
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">Or Sign Up with email</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button className="flex items-center justify-center w-full bg-gray-200 text-gray-700 p-2 rounded mb-4">
            <FcGoogle className="mr-2 text-xl" /> Sign up with Google
          </button>
        </form>

        {/* Already have an account */}
        <p className="text-center mt-4  text-gray">
          Already have an Account?{" "}
          <Link to="/sign-in">
          <a href="#" className=" text-blue-700 font-semibold hover:underline">
            Log In
          </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
