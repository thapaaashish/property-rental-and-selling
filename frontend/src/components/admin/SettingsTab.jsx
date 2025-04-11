// src/components/admin/SettingsTab.jsx
import React, { useState } from "react";
import ChangePassword from "../user/ChangePassword";

const SettingsTab = ({
  currentUser,
  actionLoading,
  setApiError,
  dispatch,
  setActionLoading,
}) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Account Settings
        </h3>

        {/* Change Password Button */}
        <button
          onClick={() => setShowChangePassword(true)}
          className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400 disabled:bg-teal-300"
          disabled={actionLoading}
        >
          Change Password
        </button>
      </div>

      {/* Change Password */}
      {showChangePassword && (
          <div className="fixed inset-0 bg-opacity-100 backdrop-blur-[1px] flex items-center justify-center">
            <ChangePassword onClose={() => setShowChangePassword(false)} />
          </div>
        
      )}
    </div>
  );
};

export default SettingsTab;
