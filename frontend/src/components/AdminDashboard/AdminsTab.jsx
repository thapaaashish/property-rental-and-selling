import React, { useState } from "react";
import { Users, X, Search } from "lucide-react";
import AdminCard from "./AdminCard";
import Popup from "../common/Popup";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminsTab = ({
  users,
  currentUser,
  actionLoading,
  navigate,
  setUsers,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  // Log users for debugging
  console.log("Users in AdminsTab:", users);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filter only admins, case-insensitive, and apply search term
  const adminUsers = users.filter(
    (user) =>
      user.role?.toLowerCase() === "admin" &&
      `${user.fullname || ""} ${user.email || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim())
  );
  console.log("Filtered admin users:", adminUsers);

  const validateForm = () => {
    const errors = {};

    if (!formData.fullname.trim()) {
      errors.fullname = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const password = formData.password;
      if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password must include at least one uppercase letter";
      } else if (!/[a-z]/.test(password)) {
        errors.password = "Password must include at least one lowercase letter";
      } else if (!/[0-9]/.test(password)) {
        errors.password = "Password must include at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.password =
          "Password must include at least one special character";
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: "admin" }),
      });

      const data = await response.json();
      console.log("Create admin response:", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to create admin");
      }

      setUsers((prev) => [...prev, data]);
      setShowAddModal(false);
      setFormData({ fullname: "", email: "", password: "" });
      setFormErrors({});
      setPopupMessage("Admin created successfully");
      setPopupType("success");
      setShowPopup(true);
    } catch (err) {
      console.error("Error creating admin:", err);
      setPopupMessage(err.message);
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
  };

  const handleCloseAdminCard = () => {
    setSelectedAdmin(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ fullname: "", email: "", password: "" });
    setFormErrors({});
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2 text-teal-600" />
          All Admins
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search admins..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center text-sm font-medium text-white bg-teal-600 py-2 px-4 rounded-xl hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
            disabled={actionLoading}
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
            Add Admin
          </button>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 backdrop-blur-xs bg-black/30 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Create New Admin
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Close modal"
                disabled={formLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="fullname"
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border ${
                    formErrors.fullname ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                  aria-invalid={formErrors.fullname ? "true" : "false"}
                  aria-describedby={
                    formErrors.fullname ? "fullname-error" : undefined
                  }
                />
                {formErrors.fullname && (
                  <p id="fullname-error" className="mt-1 text-sm text-red-600">
                    {formErrors.fullname}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border ${
                    formErrors.email ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                  aria-invalid={formErrors.email ? "true" : "false"}
                  aria-describedby={
                    formErrors.email ? "email-error" : undefined
                  }
                />
                {formErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border ${
                    formErrors.password ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm pr-10`}
                  required
                  minLength={8}
                  aria-invalid={formErrors.password ? "true" : "false"}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                {formErrors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors text-sm font-medium"
                  disabled={formLoading}
                >
                  {formLoading ? "Creating..." : "Create Admin"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  disabled={formLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Card Modal */}
      {selectedAdmin && (
        <AdminCard admin={selectedAdmin} onClose={handleCloseAdminCard} />
      )}

      {/* Admins Table */}
      {adminUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchTerm ? "No matching admins found" : "No admins yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try a different search term"
              : "There are no registered admins in the system yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-teal-50 text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 text-left">Admin</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Joined Date</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminUsers.map((user) => (
                  <tr
                    key={user._id || Math.random()} // Fallback key if _id is undefined
                    className="hover:bg-teal-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullname || "Admin Avatar"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/40?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullname || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewAdmin(user)}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                        disabled={actionLoading}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsTab;
