// src/components/admin/OverviewTab.jsx
import React from "react";
import { Home } from "lucide-react";

const OverviewTab = ({ properties, bookings, navigate, setActiveTab }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Recent Properties
      </h2>
      {properties.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no properties in the system yet.
          </p>
          <button
            onClick={() => navigate("/create-listing")}
            className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400"
          >
            Create a Property
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.slice(0, 3).map((property) => (
            <div
              key={property._id}
              className="flex items-center p-4 border rounded-lg"
            >
              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                {property.imageUrls?.length > 0 ? (
                  <img
                    src={property.imageUrls[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <Home className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-800">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600">
                  ${property.regularPrice} {property.type === "rent" && "/mo"} ·{" "}
                  {property.bedrooms} BD · {property.bathrooms} BA
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Posted on {formatDate(property.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Bookings
          </h2>
          <div className="space-y-4">
            {bookings.slice(0, 3).map((booking) => (
              <div
                key={booking._id}
                className="flex items-center p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {booking.listing?.title || "Unknown Listing"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Booking requested by{" "}
                    {booking.user?.fullname || "Unknown User"} ·{" "}
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
