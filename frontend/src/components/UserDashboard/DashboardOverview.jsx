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

  // Empty state component
  const EmptyState = ({ icon: Icon, message, actionText, actionPath }) => (
    <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-gray-50 to-white rounded-lg">
      <Icon className="h-10 w-10 text-gray-400 mb-3" />
      <p className="text-gray-600 text-sm font-medium mb-4">{message}</p>
      {actionText && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          <Home className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );

  // Main empty state
  if (
    listings.length === 0 &&
    savedProperties.length === 0 &&
    messages.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center border border-gray-200">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 mb-4">
            <Home className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-3">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Get started by creating a property listing or exploring available
            properties.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/create-listing-landing")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <Home className="h-5 w-5" />
              Create Listing
            </button>
            <button
              onClick={() => navigate("/listings")}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              <Heart className="h-5 w-5" />
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 min-h-[calc(100vh-8rem)]">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "My Listings",
            count: listings?.length ?? 0,
            icon: Home,
            tab: "listings",
            ariaLabel: "View my listings",
          },
          {
            label: "Saved Properties",
            count: savedProperties?.length ?? 0,
            icon: Heart,
            tab: "saved",
            ariaLabel: "View saved properties",
          },
          {
            label: "Messages",
            icon: MessageSquare,
            tab: "messages",
            ariaLabel: "View messages",
          },
        ].map(({ label, count, icon: Icon, tab, ariaLabel }) => (
          <button
            key={tab}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:bg-teal-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            onClick={() => setActiveTab(tab)}
            aria-label={ariaLabel}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">{label}</p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">
                  {count}
                </h3>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <Icon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Table and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">
              Recent Listings
            </h2>
            <button
              onClick={() => setActiveTab("listings")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              View All
            </button>
          </div>
          {listings.length === 0 ? (
            <EmptyState
              icon={Home}
              message="No listings yet"
              actionText="Create Listing"
              actionPath="/create-listing-landing"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">
                      Property
                    </th>
                    <th className="px-6 py-3 text-right font-medium">For</th>
                    <th className="px-6 py-3 text-right font-medium">Price</th>
                    <th className="px-6 py-3 text-right font-medium">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.slice(0, MAX_TABLE_ROWS).map((listing) => (
                    <tr
                      key={listing._id}
                      className="hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {listing.imageUrls?.length > 0 ? (
                              <img
                                src={listing.imageUrls[0]}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full">
                                <Home className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                              {listing.title || "Untitled Listing"}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {listing.listingType || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-gray-600">
                        {listing.rentOrSale || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-900">
                          {listing.price
                            ? `Rs.${listing.price.toLocaleString()}`
                            : "N/A"}
                        </span>
                        {listing.rentOrSale === "rent" && (
                          <span className="text-xs text-gray-600 ml-1">
                            /mo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-gray-600">
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
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">
              Property Map
            </h2>
            <button
              onClick={() => setActiveTab("listings")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              View All
            </button>
          </div>
          {mapMarkers.length === 0 ? (
            <EmptyState
              icon={Home}
              message="No property locations available"
              actionText="Browse Properties"
              actionPath="/listings"
            />
          ) : (
            <div className="h-[450px]">
              <MapWithAllProperties markers={mapMarkers} />
            </div>
          )}
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
