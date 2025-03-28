import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signoutAdmin } from "../redux/admin/adminSlice"; // Assume Redux slice for admin
import { Building, Users, Home, Settings, Package } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAdmin } = useSelector((state) => state.admin); // Separate admin state
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== "admin") {
      navigate("/sign-in"); // Redirect to sign-in page
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Fetch listings
        const listingsRes = await fetch("/api/listings/all", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
        });

        if (!listingsRes.ok) {
          throw new Error(
            `Failed to fetch listings: ${listingsRes.statusText}`
          );
        }
        const listingsData = await listingsRes.json();
        setListings(listingsData);

        // Fetch users
        const usersRes = await fetch("/api/user/all", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
        });

        if (!usersRes.ok) {
          if (usersRes.status === 401) {
            // Token is expired or invalid
            navigate("/sign-in"); // Redirect to sign-in page
            return;
          }
          throw new Error(`Failed to fetch users: ${usersRes.statusText}`);
        }

        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching admin data:", error.message);
        setError(error.message);
      }
    };

    fetchAdminData();
  }, [currentAdmin, navigate]);

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`/api/listings/delete/${propertyId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentAdmin.token}`,
          },
        });

        if (response.ok) {
          setProperties(
            properties.filter((property) => property._id !== propertyId)
          );
        } else {
          console.error("Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/user/delete/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentAdmin.token}`,
          },
        });

        if (response.ok) {
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          console.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSignout = async () => {
    try {
      await fetch("/api/admin/signout", { method: "POST" });
      dispatch(signoutAdmin());
      navigate("/admin/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 max-h-screen">
        <h2 className="text-xl font-bold text-teal-700 flex items-center mb-6">
          <Building className="mr-2 h-5 w-5" />
          Admin Dashboard
        </h2>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "overview"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="h-5 w-5 mr-3" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "properties"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="h-5 w-5 mr-3" /> Properties
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "users"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5 mr-3" /> Users
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center p-3 rounded-lg w-full text-left ${
              activeTab === "settings"
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleSignout}
            className="flex items-center text-sm text-gray-600 hover:text-teal-700"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              <span className="text-black">
                {currentAdmin?.fullname || "Admin"}
              </span>
              !
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Properties
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {properties.length}
                  </h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Active Users
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {users.length}
                  </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Properties Sold
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {properties.filter((p) => p.rentOrSale === "Sale").length}
                  </h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === "overview" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Properties
                </h2>
                <div className="space-y-4">
                  {properties.slice(0, 3).map((property) => (
                    <div
                      key={property._id}
                      className="flex items-center p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                          <img
                            src={property.imageUrls[0]}
                            alt={property.title}
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
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${property.price} · {property.bedrooms} BD ·{" "}
                          {property.bathrooms} BA
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Posted on {formatDate(property.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => navigate("/create-listing-landing")}
                      className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
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
                      Add New Property
                    </button>
                    <button
                      onClick={() => navigate("/listings")}
                      className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
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
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
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
                      Update Settings
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
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
              </div>
            )}

            {activeTab === "properties" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    All Properties
                  </h2>
                  <button
                    onClick={() => navigate("/create-listing")}
                    className="flex items-center text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
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
                {properties.length === 0 ? (
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
                      No properties yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      There are no properties in the system yet.
                    </p>
                    <button
                      onClick={() => navigate("/create-listing-landing")}
                      className="text-sm font-medium text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
                    >
                      Create a Property
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
                            Type
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
                        {properties.map((property) => (
                          <tr key={property._id}>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                                  {property.imageUrls &&
                                  property.imageUrls.length > 0 ? (
                                    <img
                                      src={property.imageUrls[0]}
                                      alt={property.title}
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
                                    {property.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${property.price} · {property.bedrooms} BD ·{" "}
                                    {property.bathrooms} BA
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  property.rentOrSale === "Sale"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {property.rentOrSale}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {formatDate(property.createdAt)}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    navigate(`/edit-listing/${property._id}`)
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProperty(property._id)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
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

            {activeTab === "users" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  All Users
                </h2>
                {users.length === 0 ? (
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No users yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      There are no registered users in the system yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined Date
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullname}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/user/${user._id}`)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
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

            {activeTab === "settings" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Admin Settings
                </h2>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Account Information
                    </h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const updates = {
                          fullname: formData.get("fullname"),
                          email: formData.get("email"),
                        };
                        try {
                          const response = await fetch(
                            `/api/admin/update/${currentAdmin._id}`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${currentAdmin.token}`,
                              },
                              body: JSON.stringify(updates),
                            }
                          );
                          if (response.ok) {
                            alert("Profile updated successfully!");
                          } else {
                            console.error("Failed to update profile");
                          }
                        } catch (error) {
                          console.error("Error updating profile:", error);
                        }
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullname"
                            defaultValue={currentAdmin?.fullname || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            defaultValue={currentAdmin?.email || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Change Password
                    </h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const updates = {
                          currentPassword: formData.get("currentPassword"),
                          newPassword: formData.get("newPassword"),
                        };
                        try {
                          const response = await fetch(
                            `/api/admin/update-password`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${currentAdmin.token}`,
                              },
                              body: JSON.stringify(updates),
                            }
                          );
                          if (response.ok) {
                            alert("Password updated successfully!");
                          } else {
                            console.error("Failed to update password");
                          }
                        } catch (error) {
                          console.error("Error updating password:", error);
                        }
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmNewPassword"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
