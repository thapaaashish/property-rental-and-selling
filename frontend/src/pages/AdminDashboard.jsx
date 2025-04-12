import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import LoadingSpinner from "../components/admin/LoadingSpinner";
import OverviewTab from "../components/admin/OverviewTab";
import PropertiesTab from "../components/admin/PropertiesTab";
import SettingsTab from "../components/admin/SettingsTab";
import StatsOverview from "../components/admin/StatsOverview";
import UsersTab from "../components/admin/UsersTab";
import AdminsTab from "../components/admin/AdminsTab";
import Popup from "../components/Popup";
import { Home, Package, Users, Settings, Menu, X, Shield } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [apiError, setApiError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDeletePropertyPopup, setShowDeletePropertyPopup] = useState(false);
  const [showDeleteUserPopup, setShowDeleteUserPopup] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const listingsRes = await fetch("/api/admin/listings", {
          method: "GET",
          credentials: "include",
        });
        const listingsData = await listingsRes.json();
        if (listingsData.success === false) {
          throw new Error(listingsData.message || "Failed to fetch listings");
        }
        setProperties(listingsData);

        const usersRes = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "include",
        });
        const usersData = await usersRes.json();
        if (usersData.success === false) {
          throw new Error(usersData.message || "Failed to fetch users");
        }
        setUsers(usersData);

        const bookingsRes = await fetch("/api/admin/bookings", {
          method: "GET",
          credentials: "include",
        });
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success === false) {
          throw new Error(bookingsData.message || "Failed to fetch bookings");
        }
        setBookings(bookingsData);
      } catch (err) {
        setApiError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, navigate]);

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${propertyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
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
      const response = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
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

  const handleSignout = async () => {
    try {
      dispatch(signOutUserStart());
      const response = await fetch("/api/auth/signout", {
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
      {/* Sidebar Toggle Button */}
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

      {/* Enhanced Sidebar */}
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
            { id: "users", icon: Users, label: "Users" },
            { id: "admins", icon: Shield, label: "Admins" }, // New Admins tab
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
          className={`p-4 border-t ${
            sidebarCollapsed ? "px-3" : "px-6"
          } space-y-2`}
        >
          <button
            onClick={handleSignout}
            disabled={loading}
            className={`flex items-center w-full text-gray-600 hover:text-teal-700 cursor-pointer ${
              sidebarCollapsed ? "justify-center" : ""
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={sidebarCollapsed ? "Sign Out" : ""}
          >
            <Home className="h-5 w-5" />
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm">
                {loading ? "Signing out..." : "Sign Out"}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/")}
            className={`flex items-center w-full text-gray-600 hover:text-teal-700 cursor-pointer ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
            title={sidebarCollapsed ? "Go to Website" : ""}
          >
            <Home className="h-5 w-5" />
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm">Go to Website</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
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
                navigate={navigate}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "properties" && (
              <PropertiesTab
                properties={properties}
                handleDeleteProperty={handleDeleteProperty}
                actionLoading={actionLoading}
                navigate={navigate}
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
            {activeTab === "admins" && (
              <AdminsTab
                users={users}
                currentUser={currentUser}
                handleDeleteUser={handleDeleteUser}
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
    </div>
  );
};

export default AdminDashboard;
