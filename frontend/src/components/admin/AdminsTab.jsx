import React, { useState } from "react";
import { Users } from "lucide-react";
import AdminCard from "./AdminCard"; // Import the new AdminCard component

const AdminsTab = ({
  users,
  currentUser,
  actionLoading,
  navigate,
  setUsers,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // State for selected admin
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filter only admins
  const adminUsers = users.filter((user) => user.role === "admin");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/create-admin", {
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

      // Update users state with the new admin
      setUsers((prev) => [...prev, data]);
      setShowAddForm(false);
      setFormData({ fullname: "", email: "", password: "" });
    } catch (err) {
      setFormError(err.message);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Admins</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400"
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

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Admin
          </h3>
          <form onSubmit={handleAddAdmin}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {formError && (
              <p className="mt-2 text-sm text-red-600">{formError}</p>
            )}
            <div className="mt-4 flex space-x-2">
              <button
                type="submit"
                className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400 disabled:bg-teal-300"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-sm font-medium text-gray-700 bg-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300"
                disabled={formLoading}
              >
                Cancel
              </button>
            </div>
          </form>
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
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
              {adminUsers.map((user) => (
                <tr key={user._id}>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewAdmin(user)}
                        className="text-teal-500 hover:text-teal-600"
                        disabled={actionLoading}
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
  );
};

export default AdminsTab;
