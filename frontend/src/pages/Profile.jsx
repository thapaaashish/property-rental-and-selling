import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle, Camera, Edit2, Mail, Phone, MapPin } from "lucide-react";
import ChangePassword from "../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "../components/user/DeleteAccount";
import { updateUser } from "../redux/user/userSlice";
import heic2any from "heic2any";

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
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userProfile),
      });

      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json(); // Parse the success response
      dispatch(updateUser(data)); // Update Redux store
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let imageFile = file;

        // Check the file type
        console.log("File type:", file.type);

        // Convert .heic to .jpg if the file is in .heic format
        if (file.name.toLowerCase().endsWith(".heic")) {
          const conversionResult = await heic2any({
            blob: file,
            toType: "image/jpeg", // Convert to JPEG
            quality: 0.8, // Adjust quality (0 to 1)
          });
          console.log("Conversion result:", conversionResult);

          imageFile = new File(
            [conversionResult],
            file.name.replace(/\.heic$/i, ".jpg"),
            {
              type: "image/jpeg",
            }
          );
        }

        // Show the selected image in the profile frame immediately
        const localImageUrl = URL.createObjectURL(imageFile);
        console.log("Local image URL:", localImageUrl);
        setUserProfile((prev) => ({
          ...prev,
          avatar: localImageUrl, // Temporarily set the local image URL
        }));

        // Upload the image to Cloudinary
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );
        formData.append("folder", "HomeFinder/profile_picture/users"); // Specify the folder in Cloudinary

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
          console.error("Cloudinary API Error:", errorResponse);
          throw new Error("Failed to upload image to Cloudinary");
        }

        // Get the secure URL from Cloudinary
        const result = await response.json();
        const imageUrl = result.secure_url;

        // Save the image URL to the database
        const saveResponse = await fetch("/api/user/upload-profile-picture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(
            errorData.message || "Failed to save profile picture"
          );
        }

        // Update the user profile in the state and Redux store
        const updatedUser = { ...userProfile, avatar: imageUrl };
        setUserProfile(updatedUser);
        dispatch(updateUser(updatedUser)); // Update Redux store
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        // Revert to the previous avatar if the upload fails
        setUserProfile((prev) => ({
          ...prev,
          avatar: currentUser.avatar, // Revert to the original avatar
        }));
      }
    }
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
                    currentUser.avatar ||
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
                  {currentUser.fullname || "User"}
                </h2>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified User</span>
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
                        value={userProfile.fullname}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.fullname}</p>
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
                          value={userProfile.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.phone}</p>
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
                          value={userProfile.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.address}</p>
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
                        value={userProfile.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.city}</p>
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
                        value={userProfile.province}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.province}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="zipCode"
                        value={userProfile.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.zipCode}</p>
                    )}
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
                          onClick={() => setShowDeleteAccount(true)}
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

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile;
