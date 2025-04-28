import React, { useState, useMemo } from "react";
import { Home, Heart, MessageSquare } from "lucide-react";
import { MapWithAllProperties } from "../GoogleMap";
import PropTypes from "prop-types";

const MAX_TABLE_ROWS = 5;

const DashboardOverview = ({
  listings = [],
  savedProperties = [],
  messages = [],
  formatDate,
  navigate,
  setActiveTab,
}) => {
  // Memoized map markers
  const mapMarkers = useMemo(() => {
    return listings
      .filter((prop) => prop.location?.coordinates?.length === 2)
      .map((property) => ({
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
        title: property.title,
        listingId: property._id,
      }));
  }, [listings]);

  // Empty state
  if (
    listings.length === 0 &&
    savedProperties.length === 0 &&
    messages.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Yet</h2>
          <p className="text-gray-600 text-sm mb-6">
            Start by creating a property or browsing listings.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/create-listing-landing")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Create Listing
            </button>
            <button
              onClick={() => navigate("/listings")}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-4 w-4" />
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for tables
  const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-6">
      <Icon className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-gray-500 text-xs">{message}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 p-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <button
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:bg-teal-50 transition-colors"
          onClick={() => setActiveTab("listings")}
          aria-label="View my listings"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Listings</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                {listings?.length ?? 0}
              </h3>
            </div>
            <div className="bg-teal-100 p-2 sm:p-3 rounded-full">
              <Home className="h-5 sm:h-6 w-5 sm:w-6 text-teal-600" />
            </div>
          </div>
        </button>
        <button
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:bg-teal-50 transition-colors"
          onClick={() => setActiveTab("saved")}
          aria-label="View saved properties"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Saved Properties
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                {savedProperties?.length ?? 0}
              </h3>
            </div>
            <div className="bg-teal-100 p-2 sm:p-3 rounded-full">
              <Heart className="h-5 sm:h-6 w-5 sm:w-6 text-teal-600" />
            </div>
          </div>
        </button>
        <button
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:bg-teal-50 transition-colors"
          onClick={() => setActiveTab("messages")}
          aria-label="View messages"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Messages</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                {messages?.length ?? 0}
              </h3>
            </div>
            <div className="bg-teal-100 p-2 sm:p-3 rounded-full">
              <MessageSquare className="h-5 sm:h-6 w-5 sm:w-6 text-teal-600" />
            </div>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Listings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Recent Listings
              </h2>
              <button
                onClick={() => setActiveTab("listings")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {listings.length === 0 ? (
              <EmptyState icon={Home} message="No listings yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">Property</th>
                      <th className="px-4 py-2 text-right">For</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Posted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.slice(0, MAX_TABLE_ROWS).map((listing) => (
                      <tr
                        key={listing._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              {listing.imageUrls?.length > 0 ? (
                                <img
                                  src={listing.imageUrls[0]}
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <Home className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-2">
                              <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">
                                {listing.title || "Untitled Listing"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {listing.listingType || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-500">
                          {listing.rentOrSale || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-800">
                            {listing.price ? `$${listing.price}` : "N/A"}
                          </span>
                          {listing.rentOrSale === "rent" && (
                            <span className="text-xs text-gray-500 ml-1">
                              /mo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-500">
                          {formatDate(listing.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Property Map Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Property Map
              </h2>
              <button
                onClick={() => setActiveTab("listings")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {mapMarkers.length === 0 ? (
              <EmptyState
                icon={Home}
                message="No property locations available"
              />
            ) : (
              <div className="h-64">
                <MapWithAllProperties markers={mapMarkers} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Charts and Messages */}
        <div className="space-y-4">
          {/* Recent Messages Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Recent Messages
              </h2>
              <button
                onClick={() => setActiveTab("messages")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {messages.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No messages yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">Sender</th>
                      <th className="px-4 py-2 text-right">Message</th>
                      <th className="px-4 py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.slice(0, MAX_TABLE_ROWS).map((message) => (
                      <tr
                        key={message._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                            {message.sender?.fullname || "Unknown Sender"}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">
                            {message.sender?.email || "No email"}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <p className="text-xs text-gray-700 truncate max-w-[150px]">
                            {message.content || "No content"}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  listings: PropTypes.array,
  savedProperties: PropTypes.array,
  messages: PropTypes.array,
  formatDate: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default DashboardOverview;
