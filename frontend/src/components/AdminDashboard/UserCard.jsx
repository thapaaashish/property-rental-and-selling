import React from "react";
import {
  Users,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

const UserCard = ({
  user,
  onClose,
  onBanToggle,
  onKycVerify,
  actionLoading,
  isCurrentUser,
}) => {
  const formatDate = (dateString) =>
    dateString
      ? (() => {
          const date = new Date(dateString);
          const dateOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
          };
          const timeOptions = { hour: "2-digit", minute: "2-digit" };
          return {
            date: date.toLocaleDateString("en-US", dateOptions),
            time: date.toLocaleTimeString("en-US", timeOptions),
          };
        })()
      : { date: "N/A", time: "N/A" };

  const isBanned = user.banStatus?.isBanned || false;
  const isProfileComplete = user.profileCompleted;
  const kycStatus = user.kyc?.status || "not_verified";

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
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            User Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close user details"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Avatar and Name */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-16 w-16">
              {user.avatar &&
              user.avatar !==
                "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1742463191/blank-profile-picture-973460_1280_u3cxlw.webp" ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.fullname || "User avatar"}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {user.fullname}
              </h4>
              <p className="text-sm text-gray-500">ID: {user._id}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">
                {user.email}
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.emailVerified ? "Verified" : "Not Verified"}
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
                {formatDate(user.createdAt).time}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-1 flex flex-col gap-2">
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
                {isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
              </span>
              {isBanned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Banned
                </span>
              )}
            </div>
          </div>

          {/* KYC Details */}
          <div>
            <p className="text-sm font-medium text-gray-500">
              KYC Verification
            </p>
            <div className="mt-1 space-y-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  kycStatus === "verified"
                    ? "bg-green-100 text-green-800"
                    : kycStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : kycStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {kycStatus.replace("_", " ").toUpperCase()}
              </span>
              {user.kyc?.documentUrl && (
                <p className="text-sm text-gray-900">
                  <a
                    href={user.kyc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View KYC Document
                  </a>
                </p>
              )}
              {kycStatus === "rejected" && (
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Rejection Reason:</span>{" "}
                  {user.kyc.rejectedReason || "Not specified"}
                </p>
              )}
            </div>
          </div>

          {/* Ban Details (if banned) */}
          {isBanned && (
            <div>
              <p className="text-sm font-medium text-gray-500">Ban Details</p>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Reason:</span>{" "}
                  {user.banStatus.reason || "Not specified"}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Banned At:</span>{" "}
                  {formatDate(user.banStatus.bannedAt).date}{" "}
                  {formatDate(user.banStatus.bannedAt).time}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Banned By:</span>{" "}
                  {user.banStatus.bannedBy
                    ? `Admin ID: ${user.banStatus.bannedBy}`
                    : "System"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {kycStatus === "pending" && (
            <>
              <button
                onClick={() => onKycVerify(user._id, "verified")}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 bg-green-600 hover:bg-green-700 ${
                  actionLoading || isCurrentUser
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={actionLoading || isCurrentUser}
                aria-label="Approve KYC"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve KYC
              </button>
              <button
                onClick={() => onKycVerify(user._id, "rejected")}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 bg-red-600 hover:bg-red-700 ${
                  actionLoading || isCurrentUser
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={actionLoading || isCurrentUser}
                aria-label="Reject KYC"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject KYC
              </button>
            </>
          )}
          <button
            onClick={() => onBanToggle(user._id, !isBanned)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 ${
              isBanned
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } ${
              actionLoading || isCurrentUser
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={actionLoading || isCurrentUser}
            aria-label={`${isBanned ? "Unban" : "Ban"} user ${user.fullname}`}
          >
            {isBanned ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unban
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Ban
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150"
            aria-label="Close user details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
