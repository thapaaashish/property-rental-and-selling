import React, { useState } from "react";
import { Users, X } from "lucide-react";
import AdminCard from "./AdminCard";
import Popup from "../common/Popup";

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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filter only admins
  const adminUsers = users.filter((user) => user.role === "admin");

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
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    setFormErrors((prev) => ({ ...prev, [name]: null }));
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
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: "admin" }),
      });

      const data = await response.json();
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2 text-teal-600" />
          All Admins
        </h2>
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
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border ${
                    formErrors.password ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                  minLength={6}
                  aria-invalid={formErrors.password ? "true" : "false"}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                />
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
            No admins yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no registered admins in the system yet.
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
                    key={user._id}
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
