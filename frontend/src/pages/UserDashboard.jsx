import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import EditListingForm from "./EditListingForm";
import Wishlists from "./Wishlists";
import Profile from "./Profile";
import Popup from "../components/common/Popup";
import BookingRequests from "../components/UserDashboard/BookingRequests";
import {
  Home,
  Heart,
  MessageSquare,
  User,
  Package,
  Clock,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import MyListings from "../components/UserDashboard/MyListings";
import DashboardOverview from "../components/UserDashboard/DashboardOverview";
import Messages from "../components/UserDashboard/Messages";
import LoadingSpinner from "../components/common/LoadingSpinner";

const API_BASE = import.meta.env.VITE_API_URL;

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const [listings, setListings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingListing, setEditingListing] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const listingsResponse = await fetch(
          `${API_BASE}/api/listings/user/${currentUser._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
          }
        );
        const savedResponse = await fetch(`${API_BASE}/api/wishlist/get`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.refreshToken}`,
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
    try {
      const response = await fetch(
        `${API_BASE}/api/listings/delete/${listingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentUser.refreshToken}` },
        }
      );

      if (response.ok) {
        setListings(listings.filter((l) => l._id !== listingId));
        setShowDeletePopup(true);
        return true;
      } else {
        console.error("Failed to delete listing:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      return false;
    }
  };

  const handleRemoveSaved = async (propertyId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/users/remove-saved/${propertyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentUser.refreshToken}` },
        }
      );
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

  const handleSignout = async () => {
    try {
      dispatch(signOutUserStart());
      const response = await fetch(`${API_BASE}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || "Failed to sign out");
      }
      dispatch(signOutUserSuccess());
      navigate("/sign-in");
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Toggle Button - Visible on all screens */}
      <button
        className={`fixed top-4 z-50 p-3 rounded-full bg-white cursor-pointer shadow-md transition-all duration-300 hover:bg-gray-100 ${
          sidebarOpen ? "left-[15rem]" : "left-4"
        } ${sidebarCollapsed ? "md:left-[5.5rem]" : "md:left-[15rem]"}`}
        onClick={() => {
          if (window.innerWidth < 768) {
            setSidebarOpen(!sidebarOpen);
          } else {
            setSidebarCollapsed(!sidebarCollapsed);
          }
        }}
      >
        {sidebarOpen || sidebarCollapsed ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40`}
      >
        {/* Sidebar Header */}
        <div className={`p-4 ${sidebarCollapsed ? "px-3" : "px-6"} border-b`}>
          <h2 className="flex items-center">
            {!sidebarCollapsed ? (
              <>
                <Home className="h-6 w-6 mr-2 text-teal-600" />
                <span className="text-xl font-bold text-teal-700">
                  User Dashboard
                </span>
              </>
            ) : (
              <Home className="h-6 w-6 mx-auto text-teal-600" />
            )}
          </h2>
        </div>

        {/* Enhanced Navigation with Larger Icons */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-4">
          {[
            { id: "overview", icon: Package, label: "Overview" },
            { id: "listings", icon: Home, label: "My Listings" },
            { id: "saved", icon: Heart, label: "Saved Properties" },
            { id: "bookings", icon: Clock, label: "Booking Requests" },
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "profile", icon: User, label: "Profile Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`flex items-center cursor-pointer w-full ${
                sidebarCollapsed ? "px-3 py-4 justify-center" : "px-6 py-3"
              } ${
                activeTab === tab.id
                  ? "bg-teal-50 text-teal-700 border-r-4 border-teal-500"
                  : "text-gray-600 hover:bg-gray-50"
              } transition-colors duration-200`}
              title={sidebarCollapsed ? tab.label : ""}
            >
              <tab.icon
                className={`${sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"}`}
              />
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm font-medium">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Enhanced Footer */}
        <div
          className={`mt-auto border-t px-4 py-3 ${
            sidebarCollapsed ? "px-3 py-4" : "px-6 py-4"
          }`}
        >
          <div className="space-y-2">
            <button
              onClick={handleSignout}
              disabled={loading}
              className={`flex items-center w-full cursor-pointer text-sm font-medium rounded-md transition-colors duration-200 ${
                sidebarCollapsed ? "justify-center" : "justify-start"
              } ${
                loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              } p-2`}
              title={sidebarCollapsed ? "Log Out" : ""}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && (
                <span className="ml-3">
                  {loading ? "Logging out..." : "Log Out"}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className={`flex items-center w-full cursor-pointer text-sm font-medium rounded-md transition-colors duration-200 ${
                sidebarCollapsed ? "justify-center" : "justify-start"
              } text-gray-600 hover:bg-teal-50 hover:text-teal-700 p-2`}
              title={sidebarCollapsed ? "Go to Website" : ""}
            >
              <Home className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Go to Website</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
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
          <div className="bg-white rounded-xl shadow-sm W-gray-100 overflow-hidden">
            {activeTab === "overview" && (
              <DashboardOverview
                listings={listings}
                savedProperties={savedProperties}
                messages={messages}
                formatDate={formatDate}
                navigate={navigate}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "listings" && (
              <MyListings
                listings={listings}
                setListings={setListings}
                formatDate={formatDate}
                handleEditListing={handleEditListing}
                handleDeleteListing={handleDeleteListing}
                handleViewListing={handleViewListing}
                currentUser={currentUser}
              />
            )}

            {activeTab === "saved" && (
              <div className="p-4 md:p-6">
                <Wishlists />
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="p-4 md:p-6">
                <BookingRequests />
              </div>
            )}

            {activeTab === "messages" && (
              <Messages
                messages={messages}
                formatDate={formatDate}
                navigate={navigate}
                currentUser={currentUser}
              />
            )}

            {activeTab === "profile" && (
              <div>
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
