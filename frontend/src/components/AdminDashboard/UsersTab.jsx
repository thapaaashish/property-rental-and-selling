import React, { useState, useEffect } from "react";
import {
  Users,
  Lock,
  Unlock,
  Info,
  Filter,
  Search,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";
import axios from "axios";
import Popup from "../common/Popup";
import UserCard from "./UserCard";
import DeleteConfirmation from "../common/DeleteConfirmation";
import ReasonInputModal from "./ReasonInputModal";
import RefreshButton from "../common/RefreshButton";

const API_BASE = import.meta.env.VITE_API_URL;

const UsersTab = ({
  users: initialUsers = [],
  currentUser,
  handleDeleteUser,
  actionLoading,
  navigate,
}) => {
  const [users, setUsers] = useState(initialUsers);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [banDetails, setBanDetails] = useState(null);
  const [filter, setFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBanReasonModal, setShowBanReasonModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const usersPerPage = 10;

  // Check if user is authenticated
  const isAuthenticated = () => !!currentUser?.refreshToken;

  useEffect(() => {
    setUsers(initialUsers);
    setTotalPages(Math.ceil(initialUsers.length / usersPerPage));
  }, [initialUsers]);

  const formatDate = (dateString) =>
    dateString
      ? (() => {
          const date = new Date(dateString);
          const dateOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
          };
          const timeOptions = {
            hour: "2-digit",
            minute: "2-digit",
          };
          return {
            date: date.toLocaleDateString("en-US", dateOptions),
            time: date.toLocaleTimeString("en-US", timeOptions),
          };
        })()
      : { date: "N/A", time: "N/A" };

  const fetchUsers = async (pageNum = 1) => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to view users");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/users?page=${pageNum}&limit=${usersPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );

      // Make sure to handle the response data properly
      const usersData =
        response.data?.data?.users || response.data?.users || [];
      const totalCount =
        response.data?.data?.total || response.data?.total || 0;

      setUsers(usersData);
      setTotalPages(Math.ceil(totalCount / usersPerPage));
      setPage(pageNum);
      setPopupMessage("Users refreshed successfully");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to fetch users"
        );
        setPopupType("error");
        setShowPopup(true);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Initial fetch if no users and authenticated
  useEffect(() => {
    if (!initialUsers.length && !users.length && isAuthenticated()) {
      fetchUsers(page);
    }
  }, [initialUsers, users.length, currentUser]);

  const handleBanToggle = async (userId, ban) => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to perform this action");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (ban) {
      setSelectedUserId(userId);
      setShowBanReasonModal(true);
    } else {
      setLoadingStates((prev) => ({ ...prev, [userId]: true }));
      try {
        const response = await axios.patch(
          `${API_BASE}/api/admin/users/${userId}/ban`,
          { isBanned: false },
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
            withCredentials: true,
          }
        );
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  banStatus: response.data.user.banStatus,
                  isBanned: false,
                }
              : user
          )
        );
        setPopupMessage(response.data.message || "User unbanned");
        setPopupType("success");
        setShowPopup(true);
      } catch (error) {
        console.error("Error in handleBanToggle:", error);
        if (error.response?.status === 401) {
          setPopupMessage("Session expired. Please log in again.");
          setPopupType("error");
          setShowPopup(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setPopupMessage(
            error.response?.data?.message || "Failed to update ban status"
          );
          setPopupType("error");
          setShowPopup(true);
        }
      } finally {
        setTimeout(() => {
          setLoadingStates((prev) => ({ ...prev, [userId]: false }));
        }, 500);
      }
    }
  };

  const handleBanSubmit = async (reason) => {
    if (!currentUser?.refreshToken) {
      setPopupMessage("Please log in to perform this action");
      setPopupType("error");
      setShowPopup(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [selectedUserId]: true }));
    try {
      const response = await axios.patch(
        `${API_BASE}/api/admin/users/${selectedUserId}/ban`,
        { isBanned: true, reason },
        {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          withCredentials: true,
        }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUserId
            ? {
                ...user,
                banStatus: response.data.user.banStatus,
                isBanned: true,
              }
            : user
        )
      );
      setPopupMessage(response.data.message || "User banned");
      setPopupType("success");
      setShowPopup(true);
    } catch (error) {
      console.error("Error in handleBanSubmit:", error);
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please log in again.");
        setPopupType("error");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopupMessage(
          error.response?.data?.message || "Failed to update ban status"
        );
        setPopupType("error");
        setShowPopup(true);
      }
    } finally {
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [selectedUserId]: false }));
        setShowBanReasonModal(false);
        setSelectedUserId(null);
      }, 500);
    }
  };

  const regularUsers = users
    .filter((user) => user.role !== "admin")
    .filter((user) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "banned" && user.banStatus?.isBanned) ||
        (filter === "active" && !user.banStatus?.isBanned);

      const matchesKycFilter =
        kycFilter === "all" ||
        (kycFilter === "pending" && user.kyc?.status === "pending") ||
        (kycFilter === "verified" && user.kyc?.status === "verified") ||
        (kycFilter === "rejected" && user.kyc?.status === "rejected") ||
        (kycFilter === "not_verified" && user.kyc?.status === "not_verified");

      const matchesSearch = `${user.fullname || ""} ${user.email || ""} ${
        user.banStatus?.reason || ""
      } ${user.kyc?.rejectedReason || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesFilter && matchesKycFilter && matchesSearch;
    });

  return (
    <div className="p-6">
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      <ReasonInputModal
        isOpen={showBanReasonModal}
        onClose={() => {
          setShowBanReasonModal(false);
          setSelectedUserId(null);
        }}
        onSubmit={handleBanSubmit}
        title="Ban User"
        actionLabel="Ban User"
        entityName="banning this user"
        loading={loadingStates[selectedUserId] || false}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 text-sm ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-2 text-sm ${
                  filter === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("banned")}
                className={`px-3 py-2 text-sm ${
                  filter === "banned"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Banned
              </button>
            </div>
            <div className="relative">
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All KYC</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="not_verified">Not Verified</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <RefreshButton
              onRefresh={() => fetchUsers(page)}
              disabled={
                actionLoading || loadingStates.fetch || !isAuthenticated()
              }
            />
          </div>
        </div>
      </div>
      {loadingStates.fetch ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : regularUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {isAuthenticated()
              ? searchTerm
                ? "No matching users found"
                : filter === "banned"
                ? "No banned users"
                : filter === "active"
                ? "No active users"
                : kycFilter !== "all"
                ? `No users with ${kycFilter.replace("_", " ")} KYC status`
                : "No users yet"
              : "Please log in to view users"}
          </h3>
          <p className="text-gray-600">
            {isAuthenticated()
              ? searchTerm
                ? "Try a different search term"
                : "There are no users matching the current filter"
              : "Log in to manage users"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regularUsers.map((user) => {
                  const isBanned = user.banStatus?.isBanned || false;
                  const banStatus = user.banStatus;
                  const isProfileComplete = user.profileCompleted;
                  const kycStatus = user.kyc?.status || "not_verified";
                  const isLoading = loadingStates[user._id] || false;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar}
                                alt={user.fullname || "User"}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullname || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>{formatDate(user.createdAt).date}</div>
                          <div>{formatDate(user.createdAt).time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isProfileComplete
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {isProfileComplete ? (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-green-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Profile Complete
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Profile Incomplete
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                kycStatus === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : kycStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : kycStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {kycStatus === "verified" ? (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-green-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  KYC Verified
                                </>
                              ) : kycStatus === "pending" ? (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  KYC Pending
                                </>
                              ) : kycStatus === "rejected" ? (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-red-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  KYC Rejected
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="-ml-0.5 mr-1.5 h-2 w-2 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  KYC Not Submitted
                                </>
                              )}
                            </span>
                          </div>
                          {isBanned && (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <svg
                                  className="-ml-0.5 mr-1.5 h-2 w-2 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 8 8"
                                >
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                Banned
                              </span>
                              {banStatus?.bannedAt && (
                                <button
                                  onClick={() => setBanDetails(banStatus)}
                                  className="ml-2 text-xs text-blue-500 hover:text-blue-700 flex items-center"
                                  title="View ban details"
                                  disabled={isLoading}
                                >
                                  <Info className="h-3 w-3 mr-1" />
                                  Details
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setSelectedUser(
                                users.find((u) => u._id === user._id)
                              )
                            }
                            className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full"
                            disabled={actionLoading || isLoading}
                            aria-label={`View user ${
                              user.fullname || user._id
                            }`}
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <DeleteConfirmation
                            itemName="user"
                            onDelete={() => handleDeleteUser(user._id)}
                            disabled={
                              actionLoading ||
                              isLoading ||
                              user._id === currentUser._id
                            }
                          />
                          <button
                            onClick={() => handleBanToggle(user._id, !isBanned)}
                            className={`p-2 rounded-full ${
                              isBanned
                                ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                : "text-red-600 hover:text-red-800 hover:bg-red-50"
                            }`}
                            disabled={
                              actionLoading ||
                              isLoading ||
                              user._id === currentUser._id
                            }
                            title={isBanned ? "Unban user" : "Ban user"}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isBanned ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchUsers(page - 1)}
                disabled={page === 1 || loadingStates.fetch}
                className={`px-3 py-2 rounded-md ${
                  page === 1 || loadingStates.fetch
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => fetchUsers(page + 1)}
                disabled={page === totalPages || loadingStates.fetch}
                className={`px-3 py-2 rounded-md ${
                  page === totalPages || loadingStates.fetch
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
      {banDetails && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-500" />
              Ban Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Reason</p>
                <p className="mt-1 text-sm text-gray-900">
                  {banDetails.reason || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(banDetails.bannedAt).date}{" "}
                  {formatDate(banDetails.bannedAt).time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Banned By</p>
                <p className="mt-1 text-sm text-gray-900">
                  {banDetails.bannedBy
                    ? `Admin Name: ${banDetails.bannedBy}`
                    : "System"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setBanDetails(null)}
              className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              disabled={Object.values(loadingStates).some((state) => state)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {selectedUser && (
        <UserCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onBanToggle={handleBanToggle}
          actionLoading={
            actionLoading || Object.values(loadingStates).some((state) => state)
          }
          isCurrentUser={selectedUser._id === currentUser._id}
        />
      )}
    </div>
  );
};

export default UsersTab;
