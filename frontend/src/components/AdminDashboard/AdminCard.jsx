import React from "react";
import { Users, Mail, Shield, Calendar } from "lucide-react";

const AdminCard = ({ admin, onClose }) => {
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

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-600" />
            Admin Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close admin details"
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
              {admin.avatar &&
              admin.avatar !==
                "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1742463191/blank-profile-picture-973460_1280_u3cxlw.webp" ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={admin.avatar}
                  alt={admin.fullname || "Admin avatar"}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {admin.fullname || "N/A"}
              </h4>
              <p className="text-sm text-gray-500">ID: {admin._id}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">
                {admin.email}
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    admin.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {admin.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {admin.role}
              </p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Joined</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(admin.createdAt).date}{" "}
                {formatDate(admin.createdAt).time}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150"
            aria-label="Close admin details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
