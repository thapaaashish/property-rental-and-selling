import React from "react";
import { Users, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, User } from "lucide-react";

const UserProfileCard = ({ user, onEdit }) => {
  const formatDate = (dateString) =>
    dateString
      ? (() => {
          const date = new Date(dateString);
          const dateOptions = { year: "numeric", month: "short", day: "numeric" };
          const timeOptions = { hour: "2-digit", minute: "2-digit" };
          return {
            date: date.toLocaleDateString("en-US", dateOptions),
            time: date.toLocaleTimeString("en-US", timeOptions),
          };
        })()
      : { date: "N/A", time: "N/A" };

  const isProfileComplete = user.profileCompleted;

  // Combine address fields
  const fullAddress =
    [
      user.address !== "None" ? user.address : "",
      user.city !== "None" ? user.city : "",
      user.province !== "None" ? user.province : "",
      user.zipCode !== "None" ? user.zipCode : "",
    ]
      .filter(Boolean)
      .join(", ") || "Not provided";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2 text-gray-600" />
          Your Profile
        </h2>

        {/* Avatar and Name */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-20 w-20">
            {user.avatar &&
            user.avatar !==
              "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1742463191/blank-profile-picture-973460_1280_u3cxlw.webp" ? (
              <img
                className="h-20 w-20 rounded-full object-cover"
                src={user.avatar}
                alt={user.fullname}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">{user.fullname}</h3>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="flex items-start">
          <User className="h-5 w-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-500">Bio</p>
            <p className="mt-1 text-sm text-gray-900">
              {user.bio || "Tell us about yourself!"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900 flex items-center">
              {user.email}
              <span
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.emailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.emailVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Verified
                  </>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Phone */}
        {user.phone && (
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="mt-1 text-sm text-gray-900">{fullAddress}</p>
          </div>
        </div>

        {/* Joined Date */}
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-gray-400 mr-3 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-500">Joined</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(user.createdAt).date}
              <br />
              {formatDate(user.createdAt).time}
            </p>
          </div>
        </div>

        {/* Profile Status */}
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-gray-400 mr-3 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-500">Profile Status</p>
            <p className="mt-1 text-sm text-gray-900">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  isProfileComplete
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-2 w-2"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {isProfileComplete ? "Complete" : "Incomplete"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
          aria-label="Edit profile"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;