import React from "react";
import { useNavigate } from "react-router-dom";
import ForgotPasswordComponent from "../components/ForgotPasswordComponent";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    alert("Password reset successful! Please sign in with your new password.");
    navigate("/sign-in");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <ForgotPasswordComponent
        onClose={() => navigate("/sign-in")}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ForgotPassword;
