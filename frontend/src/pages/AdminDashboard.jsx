import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import OverviewTab from "../components/AdminDashboard/OverviewTab";
import PropertiesTab from "../components/AdminDashboard/PropertiesTab";
import SettingsTab from "../components/AdminDashboard/SettingsTab";
import StatsOverview from "../components/AdminDashboard/StatsOverview";
import UsersTab from "../components/AdminDashboard/UsersTab";
import AdminsTab from "../components/AdminDashboard/AdminsTab";
import ReviewsTab from "../components/AdminDashboard/ReviewsTab";
import Popup from "../components/common/Popup";
import {
  Home,
  Package,
  Users,
  Settings,
  Menu,
  X,
  Shield,
  Car,
  Calendar,
  LogOut,
  Star,
} from "lucide-react";
import MovingServicesTab from "../components/AdminDashboard/MovingServicesTab";
import KycVerification from "../components/AdminDashboard/KycVerification";
import BookingsTab from "../components/AdminDashboard/BookingsTab";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [apiError, setApiError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDeletePropertyPopup, setShowDeletePropertyPopup] = useState(false);
  const [showDeleteUserPopup, setShowDeleteUserPopup] = useState(false);
  const [showDeleteBookingPopup, setShowDeleteBookingPopup] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      console.log("Redirecting: currentUser =", currentUser);
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        // Fetch listings
        const listingsRes = await axios.get(`${API_BASE}/api/admin/listings`, {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        });

        // Fetch users with pagination
        const usersRes = await axios.get(
          `${API_BASE}/api/admin/users?page=1&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );

        // Fetch bookings
        const bookingsRes = await axios.get(
          `${API_BASE}/api/admin/bookings?populate=listing,user`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );

        // Fetch verifications
        const verificationsRes = await axios.get(
          `${API_BASE}/api/kyc/pending`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );

        // Fetch reviews
        const reviewsRes = await axios.get(
          `${API_BASE}/api/review/admin/pendingReviews`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );

        const listingsData = listingsRes.data;
        const usersData = usersRes.data;
        const bookingsData = bookingsRes.data;
        const verificationsData = verificationsRes.data;
        const reviewsData = reviewsRes.data;

        console.log("Users API response:", usersData);

        if (listingsData.success === false)
          throw new Error(listingsData.message || "Failed to fetch listings");
        if (usersData.success === false)
          throw new Error(usersData.message || "Failed to fetch users");
        if (bookingsData.success === false)
          throw new Error(bookingsData.message || "Failed to fetch bookings");
        if (verificationsData.success === false)
          throw new Error(
            verificationsData.message || "Failed to fetch verifications"
          );
        if (reviewsData.success === false)
          throw new Error(reviewsData.message || "Failed to fetch reviews");

        setProperties(Array.isArray(listingsData) ? listingsData : []);
        setUsers(
          Array.isArray(usersData.users) ? usersData.users : usersData || []
        );
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setPendingVerifications(
          Array.isArray(verificationsData.users) ? verificationsData.users : []
        );
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setApiError(err.message);
        setProperties([]);
        setUsers([]);
        setBookings([]);
        setPendingVerifications([]);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, navigate]);

  const handleDeleteBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/api/admin/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to cancel booking");
      }
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      setShowDeleteBookingPopup(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/api/admin/listings/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to delete listing");
      }
      setProperties(
        properties.filter((property) => property._id !== propertyId)
      );
      setShowDeletePropertyPopup(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/api/user/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to delete user");
      }
      setUsers(users.filter((user) => user._id !== userId));
      setShowDeleteUserPopup(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${API_BASE}/api/review/admin/pendingReviews/${reviewId}/approve`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (!response.status === 200) {
        throw new Error(data.message || "Failed to approve review");
      }
      setReviews(
        reviews.map((review) =>
          review._id === reviewId ? { ...review, status: "approved" } : review
        )
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReview = async (reviewId) => {
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${API_BASE}/api/review/admin/pendingReviews/${reviewId}/approve`,
        { status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (!response.status === 200) {
        throw new Error(data.message || "Failed to reject review");
      }
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/api/review/admin/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to delete review");
      }
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      dispatch(signOutUserStart());
      const response = await axios.post(
        `${API_BASE}/api/auth/signout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
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

      <div
        className={`fixed left-0 top-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40`}
      >
        <div className={`p-4 ${sidebarCollapsed ? "px-3" : "px-6"} border-b`}>
          <h2 className="flex items-center">
            {!sidebarCollapsed ? (
              <>
                <Home className="h-6 w-6 mr-2 text-teal-600" />
                <span className="text-xl font-bold text-teal-700">
                  Admin Dashboard
                </span>
              </>
            ) : (
              <Home className="h-6 w-6 mx-auto text-teal-600" />
            )}
          </h2>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-4">
          {[
            { id: "overview", icon: Package, label: "Overview" },
            { id: "properties", icon: Home, label: "Properties" },
            { id: "bookings", icon: Calendar, label: "Bookings" },
            { id: "moving-services", icon: Car, label: "Moving Services" },
            { id: "users", icon: Users, label: "Users" },
            { id: "reviews", icon: Star, label: "Reviews" },
            { id: "kyc", icon: Users, label: "KYC Verification" },
            { id: "admins", icon: Shield, label: "Admins" },
            { id: "settings", icon: Settings, label: "Settings" },
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

      <div
        className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {activeTab === "overview" && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome back,{" "}
                  <span className="text-black">
                    {currentUser?.fullname || "Admin"}
                  </span>
                  !
                </p>
              </div>
              <StatsOverview
                properties={properties}
                users={users}
                bookings={bookings}
                reviews={reviews}
                setActiveTab={setActiveTab}
              />
            </>
          )}

          {apiError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
              {apiError}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === "overview" && (
              <OverviewTab
                properties={properties}
                bookings={bookings}
                users={users}
                reviews={reviews}
                pendingVerifications={pendingVerifications}
                navigate={navigate}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "properties" && (
              <PropertiesTab
                properties={properties}
                currentUser={currentUser}
                handleDeleteProperty={handleDeleteProperty}
                actionLoading={actionLoading}
                navigate={navigate}
              />
            )}
            {activeTab === "bookings" && (
              <BookingsTab
                bookings={bookings}
                currentUser={currentUser}
                navigate={navigate}
                actionLoading={actionLoading}
                handleDeleteBooking={handleDeleteBooking}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={users}
                currentUser={currentUser}
                handleDeleteUser={handleDeleteUser}
                actionLoading={actionLoading}
                navigate={navigate}
              />
            )}
            {activeTab === "reviews" && (
              <ReviewsTab
                reviews={reviews}
                actionLoading={actionLoading}
                handleApproveReview={handleApproveReview}
                handleRejectReview={handleRejectReview}
                handleDeleteReview={handleDeleteReview}
                navigate={navigate}
              />
            )}
            {activeTab === "kyc" && (
              <KycVerification navigate={navigate} currentUser={currentUser} />
            )}
            {activeTab === "moving-services" && (
              <MovingServicesTab
                users={users}
                currentUser={currentUser}
                handleDeleteUser={handleDeleteUser}
                actionLoading={actionLoading}
                navigate={navigate}
              />
            )}
            {activeTab === "admins" && (
              <AdminsTab
                users={users}
                currentUser={currentUser}
                actionLoading={actionLoading}
                navigate={navigate}
                setUsers={setUsers}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                currentUser={currentUser}
                actionLoading={actionLoading}
                setApiError={setApiError}
                dispatch={dispatch}
                setActionLoading={setActionLoading}
              />
            )}
          </div>
        </div>
      </div>

      {showDeletePropertyPopup && (
        <Popup
          message="Property deleted successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowDeletePropertyPopup(false)}
        />
      )}
      {showDeleteUserPopup && (
        <Popup
          message="User deleted successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowDeleteUserPopup(false)}
        />
      )}
      {showDeleteBookingPopup && (
        <Popup
          message="Booking cancelled successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowDeleteBookingPopup(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
