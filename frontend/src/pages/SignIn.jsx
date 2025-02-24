import React, { useState } from "react";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/backend/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/");

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-semibold text-center mb-2">Login now</h2>
        <p className="text-center text-gray-600 mb-4">Hi, Welcome back 👋</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email id"
              className="w-full p-2 border rounded mt-1 focus:border-sky-500 focus:outline-sky-500 disabled:border-gray-200 disabled:bg-gray-50"
              id="email"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                className="w-full p-2 border rounded mt-1 focus:outline-sky-500"
                id="password"
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
          <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
            <a href="#" className="text-sm text-blue-500 hover:underline">Forgot Password?</a>
            </Link>
          </div>

          <button type="submit" className="w-full text-white p-2 rounded bg-pink-900 hover:bg-blue-200 hover:text-black">
            {loading ? "Loading..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">Or Sign in with Google</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button className="cursor-pointer hover:bg-gray-400 hover:text-white flex items-center justify-center w-full bg-gray-200 text-gray-700 p-2 rounded mb-4">
          <FcGoogle className="mr-2 text-xl" /> Sign in with Google
        </button>

        <Link to="/sign-up">
  <p className="text-center text-sm text-gray-600 mt-4">
    Don't have an account? <span className="text-blue-500">Sign up</span>
  </p>
</Link>

      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SignIn;
