import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle, Camera, Edit2, Mail } from "lucide-react";
import ChangePassword from "../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "../components/user/DeleteAccount";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [userProfile, setUserProfile] = useState(currentUser || {});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setshowDeleteAccount] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-teal-500 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            My Profile
          </h1>
          <p className="text-center text-blue-100">
            Manage your personal information and verification status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-blue-100">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative">
                <img
                  src={currentUser.avatar || "default-avatar-url"}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {/* Profile Picture Upload (Commented Out) */}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      // onChange={handleProfilePictureChange}
                    />
                  </label>
                )}
              </div>
              <div className="ml-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.fullname || "User"}
                </h2>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified User</span>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              {/* Edit Button (Commented Out) */}
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    // onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    // onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  // onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="pt-20 px-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "personal"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Personal Details
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "contact"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Contact Information
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "security"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Security & Verification
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-8">
              {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {currentUser.fullname || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {currentUser.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Security
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Change Password
                          </h4>
                          <p className="text-sm text-gray-500">
                            Update your password regularly for better security
                          </p>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Delete Account
                          </h4>
                          <p className="text-sm text-gray-500">
                            Permanently delete your account and all associated
                            data
                          </p>
                        </div>
                        <button
                          onClick={() => setshowDeleteAccount(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render ChangePassword component */}
      {showChangePassword && (
        <div className="fixed inset-0  bg-opacity-100 backdrop-blur-[1px] flex items-center justify-center">
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        </div>
      )}

      {/* Render DeleteAccount component */}
      {showDeleteAccount && (
        <div className="fixed inset-0  bg-opacity-100 backdrop-blur-[1px] flex items-center justify-center">
          <DeleteAccount onClose={() => setshowDeleteAccount(false)} />
        </div>
      )}
    </div>
  );
};

export default Profile;
