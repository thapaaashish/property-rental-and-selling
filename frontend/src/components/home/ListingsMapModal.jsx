import React, { useState, useEffect } from "react";
import { MapWithAllProperties } from "../GoogleMap"; // Adjust path as needed
import { X } from "lucide-react";

const ListingsMapModal = ({ isOpen, onClose }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch listings when the modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/listings/locations", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch listings");
        }
        const markers = data.map((listing) => ({
          lat: listing.location.coordinates[1], // Latitude
          lng: listing.location.coordinates[0], // Longitude
          title: listing.title,
          listingId: listing._id,
        }));
        setListings(markers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none hidden"
      }`}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[80vh] max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            All Property Listings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close map modal"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 h-[calc(100%-4rem)] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <svg
                className="animate-spin h-8 w-8 text-teal-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                />
              </svg>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {!loading && !error && <MapWithAllProperties markers={listings} />}
        </div>
      </div>
    </div>
  );
};

export default ListingsMapModal;
