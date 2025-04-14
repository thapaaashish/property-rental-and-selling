// src/components/admin/SettingsTab.jsx
import React, { useState } from "react";
import { User, Key, Trash2, Lock } from "lucide-react";
import ChangePassword from "../user/ChangePassword";
import DeleteAccount from "../user/DeleteAccount";
import AdminCard from "./AdminCard";
import ForgotPasswordComponent from "../ForgotPasswordComponent";

const SettingsTab = ({
  currentUser,
  actionLoading,
  setApiError,
  dispatch,
  setActionLoading,
}) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAdminCard, setShowAdminCard] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-600" />
            Profile
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            View and manage your admin profile details.
          </p>
          <button
            onClick={() => setShowAdminCard(true)}
            className="flex items-center text-sm font-medium text-white bg-teal-500 py-1.5 px-3 rounded-lg hover:bg-teal-400 disabled:bg-teal-300 transition-colors"
            disabled={actionLoading}
            aria-label="View admin profile"
          >
            <User className="h-4 w-4 mr-1.5" />
            View Profile
          </button>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Key className="h-5 w-5 mr-2 text-gray-600" />
            Security
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Manage your password and account security.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center text-sm font-medium text-white bg-teal-500 py-1.5 px-3 rounded-lg hover:bg-teal-400 disabled:bg-teal-300 transition-colors"
              disabled={actionLoading}
              aria-label="Change account password"
            >
              <Key className="h-4 w-4 mr-1.5" />
              Change Password
            </button>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="flex items-center text-sm font-medium text-white bg-teal-500 py-1.5 px-3 rounded-lg hover:bg-teal-400 disabled:bg-teal-300 transition-colors"
              disabled={actionLoading}
              aria-label="Reset password via OTP"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Forgot Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-red-600" />
            Danger Zone
          </h3>
          <div className="border border-red-200 rounded-md p-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                aria-label="Delete admin account"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAdminCard && (
        <AdminCard
          admin={currentUser}
          onClose={() => setShowAdminCard(false)}
        />
      )}

      {showChangePassword && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        </div>
      )}

      {showDeleteAccount && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
        </div>
      )}

      {showForgotPassword && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <ForgotPasswordComponent
            onClose={() => setShowForgotPassword(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
