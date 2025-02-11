import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom'

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Remember Me:', rememberMe);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {/* <h2 className="text-3xl font-semibold text-center mb-2">Login now</h2>
        <p className="text-center text-gray-600 mb-4">Hi, Welcome back 👋</p> */}        
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email id"
              className="w-full p-2 border rounded mt-1"
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full p-2 border rounded mt-1"
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            {/* <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              Remember Me
            </label> */}
            <a href="#" className="text-sm text-blue-500">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full text-white p-2 rounded bg-pink-700 hover:bg-pink-900" >
            Sign in
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
    </div>
  );
};

export default SignIn;
