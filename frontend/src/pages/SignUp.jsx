import React, { useState } from "react";
import { set } from "mongoose";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";

const Signup = () => {

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate =useNavigate();
  const [formData, setFormData] = useState({});

  const handleChange = (e) =>{
    setFormData({ ...formData, [e.target.id]: e.target.value});
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch("/backend/auth/signup",{
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);

      if (data.success == false){
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/sign-in");
      
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }


  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        <p className="text-center text-gray-600 mt-2">Hi, 👋</p>

        <form onSubmit={handleSubmit} className="mt-4">
          {/*Name */}
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-md p-2 mt-1"
            id="fullname"
            onChange={handleChange}
          />

          {/* userName */}
          <label className="block font-medium mt-3">Username</label>
          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-md p-2 mt-1"
            id="username"
            onChange={handleChange}
          />

          {/* Email */}
          <label className="block font-medium mt-3">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-md p-2 mt-1"
            id="email"
            onChange={handleChange}
          />

          {/* Password */}
          <label className="block font-medium mt-3">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border rounded-md p-2 mt-1 pr-10"
              id="password"
              onChange={handleChange}
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
            {loading ? "Loading..." : "Sign up"}
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
        {error && <p classname="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Signup;
