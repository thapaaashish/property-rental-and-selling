import React from "react";
import {
  Home,
  Heart,
  MessageSquare,
  User,
  Package,
  Clock,
  Menu,
  X,
} from "lucide-react";

const DashboardOverview = ({
  listings,
  savedProperties,
  messages,
  formatDate,
  navigate,
}) => {
  return (
    <div className="p-4 md:p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Listings</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {listings.length}
              </h3>
            </div>
            <div className="bg-blue-100 p-2 md:p-3 rounded-full">
              <Home className="h-5 md:h-6 w-5 md:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Saved Properties
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {savedProperties.length}
              </h3>
            </div>
            <div className="bg-green-100 p-2 md:p-3 rounded-full">
              <Heart className="h-5 md:h-6 w-5 md:w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Messages</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {messages.length}
              </h3>
            </div>
            <div className="bg-purple-100 p-2 md:p-3 rounded-full">
              <MessageSquare className="h-5 md:h-6 w-5 md:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/create-listing-landing")}
            className="flex items-center justify-center py-2 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Listing
          </button>
          <button
            onClick={() => navigate("/listings")}
            className="flex items-center justify-center py-2 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Browse Properties
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center justify-center py-2 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Update Profile
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center py-2 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back to Website
          </button>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {listings.length > 0 ? (
          listings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map((listing) => (
              <div
                key={listing._id}
                className="flex items-center p-4 border rounded-lg"
              >
                <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ${listing.price} · {listing.bedrooms} BD ·{" "}
                    {listing.bathrooms} BA
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Posted on {formatDate(listing.createdAt)}
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500">No recent listings available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
