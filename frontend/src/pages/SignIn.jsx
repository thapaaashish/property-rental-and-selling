import React, { useState } from "react";
import { set } from "mongoose";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";

const SignIn = () => {
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
      const res = await fetch("/backend/auth/signin",{
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
      navigate("/");
      
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
              className="w-full p-2 border rounded mt-1"
              id="email"
              onChange={handleChange}
            />
          </div>

          
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="w-full p-2 border rounded mt-1"
              id="password"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <a href="#" className="text-sm text-blue-500">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full text-white p-2 rounded bg-pink-700 hover:bg-pink-900" >
          {loading ? "Loading..." : "Sign in"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">Or Sign in with Google</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        
        <button className="flex items-center justify-center w-full bg-gray-200 text-gray-700 p-2 rounded mb-4">
          <FcGoogle className="mr-2 text-xl" /> Sign in with Google
        </button>
        <Link to="/sign-up">
        <p className="text-center text-sm text-gray-600 mt-4">
          Not registered yet? <a href="#" className="text-blue-500">Create an account</a> <a href="#" className="text-blue-500 font-semibold">SignUp</a>
        </p>
        </Link>
        
      </div>
      {error && <p classname="text-red-500">{error}</p>}
    </div>
  );
};

export default SignIn;
