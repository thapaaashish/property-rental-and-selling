import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Home, AlertCircle, MapPin } from "lucide-react";

const PublicUserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUserAndListings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user details
        const userResponse = await axios.get(
          `/api/user/user-details/${userId}`
        );
        setUser(userResponse.data);

        // Fetch user's listings
        const listingsResponse = await axios.get(
          `/api/listings/user-public/${userId}`
        );
        setListings(listingsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load profile or listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserAndListings();
  }, [userId]);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm text-center border border-gray-200">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || "User Not Found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {error
              ? "We couldn't load the profile."
              : "This user doesn't exist or their profile is private."}
          </p>
          <button
            onClick={() => navigate("/listings")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const fullAddress =
    [
      user.address !== "None" ? user.address : "",
      user.city !== "None" ? user.city : "",
      user.province !== "None" ? user.province : "",
      user.zipCode !== "None" ? user.zipCode : "",
    ]
      .filter(Boolean)
      .join(", ") || "Location not shared";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center text-sm text-gray-500">
          <a href="/" className="hover:text-gray-900 flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/listings" className="hover:text-gray-900">
            Listings
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {user.fullname}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="space-y-6">
                {/* Header */}
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-gray-600" />
                  {user.fullname}'s Profile
                </h2>

                {/* Avatar and Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-20 w-20">
                    {user.avatar &&
                    user.avatar !==
                      "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1742463191/blank-profile-picture-973460_1280_u3cxlw.webp" ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover"
                        src={user.avatar}
                        alt={user.fullname}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {user.fullname}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bio</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.bio || "No bio provided"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-gray-900">{fullAddress}</p>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Home className="h-6 w-6 mr-2 text-gray-600" />
                Listings by {user.fullname}
              </h2>

              {listings.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    No active listings from this user.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer"
                      onClick={() => navigate(`/property/${listing._id}`)}
                    >
                      <div className="h-48 w-full mb-4">
                        {listing.imageUrls?.[0] ? (
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                            <Home className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {listing.rentOrSale}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {listing.address?.street}, {listing.address?.city}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-2">
                        Rs {listing.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicUserProfilePage;
