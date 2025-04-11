// src/components/admin/UsersTab.jsx
import React from "react";
import { Users } from "lucide-react";

const UsersTab = ({
  users,
  currentUser,
  handleDeleteUser,
  actionLoading,
  navigate,
}) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filter out admins
  const regularUsers = users.filter((user) => user.role !== "admin");

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">All Users</h2>
      {regularUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No users yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no registered regular users in the system yet.
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
                  Profile Completed
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regularUsers.map((user) => (
                <tr key={user._id}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullname || "User Avatar"}
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
                  <td className="py-4 px-4 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.profileCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.profileCompleted ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/user/${user._id}`)}
                        className="text-teal-500 hover:text-teal-600"
                        disabled={actionLoading}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-500 hover:text-red-600"
                        disabled={actionLoading || user._id === currentUser._id}
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
  );
};

export default UsersTab;
