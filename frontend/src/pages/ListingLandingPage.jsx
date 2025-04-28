import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddListingForm from "../components/PropertyListing/CreateListingForm";

const FeatureCard = ({ title, text, icon }) => (
  <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 transition-transform transform hover:scale-105">
    <div className="text-3xl mb-4" role="img" aria-label={title}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </div>
);

const ListingLandingPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const isLoading = useSelector((state) => state.user.isLoading); // Assuming user state includes loading
  const [showForm, setShowForm] = useState(false);

  const handleStartHosting = () => {
    setShowForm(true);
  };

  const features = [
    {
      title: "Effortless Setup",
      text: "Get your listing live in minutes with our intuitive step-by-step guide.",
      icon: "🚀",
    },
    {
      title: "Flexible Control",
      text: "Manage your availability, pricing, and rules with complete ease.",
      icon: "⚙️",
    },
    {
      title: "Trusted Hosts",
      text: "Connect with verified guests and build a reputable hosting profile.",
      icon: "🤝",
    },
  ];

  // Check if profile is completed based on existing fields
  const isProfileCompleted = (user) => {
    return (
      user.phone &&
      user.address !== "None" &&
      user.city !== "None" &&
      user.province !== "None" &&
      user.zipCode !== "None"
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Render form or error messages if showForm is true
  if (showForm) {
    if (!currentUser) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-lg text-gray-700 mb-4">
            Please log in to create a listing
          </p>
          <button
            onClick={() => navigate("/sign-in")}
            className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      );
    }

    if (!isProfileCompleted(currentUser)) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-lg text-gray-700 mb-4">
            Please complete your profile to create a listing
          </p>
          <button
            onClick={() => navigate("/profile/edit")}
            className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      );
    }

    if (currentUser.kyc.status !== "verified") {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-lg text-gray-700 mb-4">
            Please verify your KYC to create a listing
          </p>
          <button
            onClick={() => navigate("/kyc-verification")}
            className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            Verify KYC
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="w-full max-w-3xl">
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 px-4 py-2 text-teal-500 hover:text-teal-600 transition-colors"
          >
            Back to Landing Page
          </button>
          <AddListingForm />
        </div>
      </div>
    );
  }

  // Render landing page content
  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section
        className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 lg:p-16"
        aria-labelledby="hero-title"
      >
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start mb-8 md:mb-0">
          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Unlock Your Space's Potential
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-lg">
            Transform your spare room or property into a thriving income source.
            HomeFinder simplifies the process, guiding you from listing to
            hosting.
          </p>
          <button
            onClick={handleStartHosting}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
            aria-label="Start hosting today"
          >
            Start Hosting Today
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-11/12 sm:w-4/5 relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="A beautifully decorated living room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="w-full p-4 md:p-8 lg:p-16 bg-white"
        aria-labelledby="features-title"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            id="features-title"
            className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-12 text-center"
          >
            Why Host with HomeFinder?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((item, index) => (
              <FeatureCard
                key={index}
                title={item.title}
                text={item.text}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListingLandingPage;
