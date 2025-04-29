import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CheckCircle,
  XCircle,
  Camera,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Upload,
  FileText,
  AlertCircle,
} from "lucide-react";
import ChangePassword from "../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "../components/user/DeleteAccount";
import { updateUser } from "../redux/user/userSlice";
import heic2any from "heic2any";
import Popup from "../components/common/Popup";

const API_BASE = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [userProfile, setUserProfile] = useState(currentUser || {});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [kycStatus, setKycStatus] = useState(
    currentUser?.kyc?.status || "not_verified"
  );
  const [kycRejectedReason, setKycRejectedReason] = useState(null);

  // Fetch KYC status
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/kyc/status/${currentUser._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setKycStatus(data.kycStatus);
          setKycRejectedReason(data.rejectedReason);
          // Update Redux store if user data changes
          if (data.user) {
            dispatch(updateUser(data.user));
          }
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };
    fetchKycStatus();
  }, [currentUser._id, dispatch]);

  // Check if profile is completed
  const isProfileCompleted = (user) => {
    return (
      user.phone &&
      user.address !== "None" &&
      user.city !== "None" &&
      user.province !== "None" &&
      user.zipCode !== "None"
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      dispatch(updateUser(data));
      setIsEditing(false);
      setPopup({
        show: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      setPopup({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        let imageFile = file;

        if (file.name.toLowerCase().endsWith(".heic")) {
          const conversionResult = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          imageFile = new File(
            [conversionResult],
            file.name.replace(/\.heic$/i, ".jpg"),
            {
              type: "image/jpeg",
            }
          );
        }

        const localImageUrl = URL.createObjectURL(imageFile);
        setUserProfile((prev) => ({
          ...prev,
          avatar: localImageUrl,
        }));

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );
        formData.append("folder", "HomeFinder/profile_picture/users");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error("Failed to upload image to Cloudinary");
        }

        const result = await response.json();
        const imageUrl = result.secure_url;

        const saveResponse = await fetch(`${API_BASE}/api/user/upload-profile-picture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ imageUrl }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(
            errorData.message || "Failed to save profile picture"
          );
        }

        const updatedUser = { ...userProfile, avatar: imageUrl };
        setUserProfile(updatedUser);
        dispatch(updateUser(updatedUser));
        setPopup({
          show: true,
          message: "Profile picture updated successfully!",
          type: "success",
        });
      } catch (error) {
        setUserProfile((prev) => ({
          ...prev,
          avatar: currentUser.avatar,
        }));
        setPopup({
          show: true,
          message: error.message,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKycUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/heic",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      setPopup({
        show: true,
        message: "Please upload a JPEG, PNG, PDF, or HEIC file",
        type: "error",
      });
      return;
    }
    if (file.size > maxSize) {
      setPopup({
        show: true,
        message: "File size must be less than 5MB",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      let uploadFile = file;

      // Convert HEIC to JPEG
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const conversionResult = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        uploadFile = new File(
          [conversionResult],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("folder", "HomeFinder/kyc_documents");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/${uploadFile.type === "application/pdf" ? "raw" : "image"}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error("Failed to upload KYC document");
      }

      const result = await response.json();
      const documentUrl = result.secure_url;

      // Send document URL to backend for KYC processing
      const saveResponse = await fetch(`${API_BASE}/api/kyc/upload/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          documentUrl,
          documentType: uploadFile.type === "application/pdf" ? "pdf" : "image",
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || "Failed to submit KYC document");
      }

      const data = await saveResponse.json();
      setKycStatus("pending");
      dispatch(updateUser(data.user));
      setPopup({
        show: true,
        message: "KYC document uploaded successfully! Awaiting verification.",
        type: "success",
      });
    } catch (error) {
      setPopup({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setPopup({ show: false, message: "", type: "error" });
  };

  const renderKycStatusLabel = () => {
    switch (kycStatus) {
      case "verified":
        return (
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
        );
      case "not_verified":
      default:
        return (
          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Not Verified</span>
          </div>
        );
    }
  };

  const renderProfileStatusLabel = () => {
    const completed = isProfileCompleted(userProfile);
    return (
      <div
        className={`flex items-center ${
          completed ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        } px-3 py-1 rounded-full`}
      >
        {completed ? (
          <CheckCircle className="h-4 w-4 mr-1" />
        ) : (
          <XCircle className="h-4 w-4 mr-1" />
        )}
        <span className="text-sm font-medium">
          {completed ? "Profile Complete" : "Profile Incomplete"}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
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

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-blue-100">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative">
                <img
                  src={
                    userProfile.avatar ||
                    "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741280259/default-avatar_oabgol.png"
                  }
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                )}
              </div>
              <div className="ml-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile.fullname || "User"}
                </h2>
                <div className="flex space-x-3 mt-2">
                  {renderKycStatusLabel()}
                  {renderProfileStatusLabel()}
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Tabs and Content */}
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullname"
                        value={userProfile.fullname || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userProfile.fullname || "N/A"}
                      </p>
                    )}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="bio"
                        value={userProfile.bio || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userProfile.bio || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {currentUser.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={userProfile.phone || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {userProfile.phone || "None"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={userProfile.address || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {userProfile.address || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={userProfile.city || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userProfile.city || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="province"
                        value={userProfile.province || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userProfile.province || "None"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="zipCode"
                        value={userProfile.zipCode || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userProfile.zipCode || "None"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Identity Verification (KYC)
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Verify your identity to unlock all features and ensure
                      secure transactions.
                    </p>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-teal-500 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Government ID
                            </h4>
                            <p className="text-sm text-gray-500">
                              Upload a valid passport, driver’s license, or ID
                              card
                            </p>
                            <p
                              className={`text-sm mt-1 ${
                                kycStatus === "verified"
                                  ? "text-green-600"
                                  : kycStatus === "pending"
                                  ? "text-yellow-600"
                                  : kycStatus === "rejected"
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              Status:{" "}
                              {kycStatus.replace("_", " ").toUpperCase()}
                              {kycStatus === "rejected" && (
                                <span className="block text-sm text-red-500 mt-1">
                                  Reason:{" "}
                                  {kycRejectedReason || "No reason provided"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {kycStatus === "verified" ? (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-md">
                            Verified
                          </span>
                        ) : (
                          <label
                            className={`flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-400 transition-colors ${
                              isLoading || kycStatus === "pending"
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {kycStatus === "pending" ? "Pending" : "Upload"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,application/pdf,image/heic"
                              onChange={handleKycUpload}
                              disabled={isLoading || kycStatus === "pending"}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
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
                            onClick={() => setShowDeleteAccount(true)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-opacity-100 backdrop-blur-[1px] flex items-center justify-center">
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        </div>
      )}

      {showDeleteAccount && (
        <div className="fixed inset-0 bg-opacity-100 backdrop-blur-[1px] flex items-center justify-center">
          <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
        </div>
      )}

      {/* Popup Notification */}
      {popup.show && (
        <Popup
          message={popup.message}
          type={popup.type}
          duration={3000}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default Profile;
