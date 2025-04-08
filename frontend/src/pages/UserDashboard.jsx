import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EditListingForm from "./EditListingForm";
import Wishlists from "./Wishlists";
import Profile from "./Profile";
import Popup from "../components/Popup";
import AgentBookings from "../components/AgentBookings";
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

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [listings, setListings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingListing, setEditingListing] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const listingsResponse = await fetch(
          `api/listings/user/${currentUser._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        const savedResponse = await fetch(`api/wishlist/get`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        if (listingsResponse.ok && savedResponse.ok) {
          const listingsData = await listingsResponse.json();
          const savedData = await savedResponse.json();
          setListings(listingsData);
          setSavedProperties(savedData);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleEditListing = (listingId) => {
    setEditingListing(listingId);
  };

  const handleSaveListing = (updatedListing) => {
    setListings(
      listings.map((l) => (l._id === updatedListing._id ? updatedListing : l))
    );
    setEditingListing(null);
    setShowEditPopup(true);
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(`/api/listings/delete/${listingId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        if (response.ok) {
          setListings(listings.filter((l) => l._id !== listingId));
          setShowDeletePopup(true);
        } else {
          console.error("Failed to delete listing:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting listing:", error);
      }
    }
  };

  const handleRemoveSaved = async (propertyId) => {
    try {
      const response = await fetch(`/api/users/remove-saved/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (response.ok) {
        setSavedProperties(savedProperties.filter((p) => p._id !== propertyId));
      } else {
        console.error("Failed to remove saved property");
      }
    } catch (error) {
      console.error("Error removing saved property:", error);
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/property/${listingId}`);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 w-64 bg-white border-r border-gray-200 flex flex-col p-6 h-screen overflow-hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40`}
      >
        <h2 className="text-xl font-bold text-teal-700 flex items-center mb-6">
          <Home className="mr-2 h-5 w-5" />
          User Dashboard
        </h2>
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "overview"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="h-5 w-5 mr-3" /> Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("listings");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "listings"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="h-5 w-5 mr-3" /> My Listings
          </button>
          <button
            onClick={() => {
              setActiveTab("saved");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "saved"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Heart className="h-5 w-5 mr-3" /> Saved Properties
          </button>
          <button
            onClick={() => {
              setActiveTab("bookings");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "bookings"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Clock className="h-5 w-5 mr-3" /> Booking Requests
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "messages"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-3" /> Messages
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "profile"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="h-5 w-5 mr-3" /> Profile Settings
          </button>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-sm text-gray-600 hover:text-teal-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Website
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              <span className="text-black">
                {currentUser?.fullname || "User"}
              </span>
              !
            </p>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === "overview" && (
              <div className="p-4 md:p-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">
                          My Listings
                        </p>
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
                        <p className="text-gray-500 text-sm font-medium">
                          Messages
                        </p>
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
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
                  ))}
                </div>
              </div>
            )}

            {activeTab === "listings" && (
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    My Listings
                  </h2>
                  <button
                    onClick={() => navigate("/create-listing")}
                    className="flex items-center text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 w-full md:w-auto justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
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
                    Add New
                  </button>
                </div>
                {listings.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No listings yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't created any property listings yet.
                    </p>
                    <button
                      onClick={() => navigate("/create-listing-landing")}
                      className="text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
                    >
                      Create Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Posted Date
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {listings.map((listing) => (
                          <tr key={listing._id}>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                                  {listing.imageUrls?.length > 0 ? (
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
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {listing.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${listing.price} · {listing.bedrooms} BD ·{" "}
                                    {listing.bathrooms} BA
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {listing.views || 0}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {formatDate(listing.createdAt)}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleEditListing(listing._id)}
                                  className="text-blue-600 hover:text-blue-900 whitespace-nowrap"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteListing(listing._id)
                                  }
                                  className="text-red-600 hover:text-red-900 whitespace-nowrap"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleViewListing(listing._id)}
                                  className="text-green-600 hover:text-green-900 whitespace-nowrap"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="p-4 md:p-6">
                <Wishlists />
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="p-4 md:p-6">
                <AgentBookings />
              </div>
            )}

            {activeTab === "messages" && (
              <div className="p-4 md:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Messages
                </h2>
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-600">
                      You haven't made any inquiries on properties yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((inquiry) => (
                      <div
                        key={inquiry._id}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-800">
                            Inquiry for: {inquiry.listingTitle}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(inquiry.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {inquiry.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                navigate(`/listing/${inquiry.listingId}`)
                              }
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Listing
                            </button>
                            <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="p-4 md:p-6">
                <Profile />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-80 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2">
            <EditListingForm
              listing={listings.find((l) => l._id === editingListing)}
              onSave={handleSaveListing}
              onCancel={handleCancelEdit}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Popup for Deletion */}
      {showDeletePopup && (
        <Popup
          message="Listing deleted successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowDeletePopup(false)}
        />
      )}

      {/* Popup for Edit Success */}
      {showEditPopup && (
        <Popup
          message="Listing updated successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowEditPopup(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
