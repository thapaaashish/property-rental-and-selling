import React from "react";
import { useNavigate } from "react-router-dom";

const ListingLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section (Full Screen) */}
      <div className="w-full h-screen flex flex-col md:flex-row items-center justify-center p-8 md:p-16">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start md:items-start">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Unlock Your Space's Potential
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
            Transform your spare room or property into a thriving income source.
            HomeFinder simplifies the process, guiding you from listing to
            hosting.
          </p>
          <button
            onClick={() => navigate("/create-listing")}
            className="px-10 py-4 bg-gradient-to-r cursor-pointer from-teal-500 to-teal-600 text-white text-lg font-semibold rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            Start Hosting Today
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
          <div className="w-4/5 relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="A beautifully decorated living room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full p-8 md:p-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
            Why Host with HomeFinder?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
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
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 transition-transform transform hover:scale-103"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingLandingPage;
