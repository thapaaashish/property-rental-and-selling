import React, { useState, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess, signInFailure } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import Popup from "./common/Popup";

const API_BASE = import.meta.env.VITE_API_URL;

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple clicks

  // Debounced click handler to prevent multiple simultaneous sign-in attempts
  const handleGoogleClick = useCallback(async () => {
    if (isProcessing) {
      console.log("Sign-in already in progress, ignoring click");
      return;
    }

    setIsProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      console.log("Initiating Google sign-in");
      const result = await signInWithPopup(auth, provider);
      const defaultAvatar =
        "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741705156/useravater_frbzaj.png";

      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL || defaultAvatar,
        }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Sign-in successful, dispatching signInSuccess");
        dispatch(signInSuccess(data));
        navigate("/");
      } else {
        console.log("Sign-in failed, showing error popup");
        dispatch(
          signInFailure(data.message || "Could not sign in with Google")
        );
        setErrorMessage(
          data.message || "Could not sign in with Google. Please try again."
        );
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      dispatch(signInFailure("An error occurred during Google sign-in"));
      setErrorMessage(
        "An error occurred during Google sign-in. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, navigate, isProcessing]);

  const handleClosePopup = () => {
    console.log("Closing popup, clearing errorMessage");
    setErrorMessage(null);
  };

  return (
    <>
      <button
        onClick={handleGoogleClick}
        disabled={isProcessing} // Disable button while processing
        className={`cursor-pointer hover:bg-gray-400 hover:text-white flex items-center justify-center w-full bg-gray-200 text-gray-700 p-2 rounded mb-4 ${
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FcGoogle className="mr-2 text-xl" /> Sign in with Google
      </button>
      {errorMessage && (
        <Popup
          message={errorMessage}
          type="error"
          duration={5000} // Show for 5 seconds
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default OAuth;
