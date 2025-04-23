import React from "react";
import { Home, Users, Calendar } from "lucide-react";

const StatsOverview = ({ properties, users, bookings, setActiveTab }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
    <button
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:bg-teal-50 transition-colors cursor-pointer"
      onClick={() => setActiveTab("properties")}
      aria-label="View total properties"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Properties</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {properties?.length ?? 0}
          </h3>
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <Home className="h-6 w-6 text-teal-600" />
        </div>
      </div>
    </button>
    <button
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:bg-teal-50 transition-colors cursor-pointer"
      onClick={() => setActiveTab("users")}
      aria-label="View active users"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Active Users</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {users?.length ?? 0}
          </h3>
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <Users className="h-6 w-6 text-teal-600" />
        </div>
      </div>
    </button>
    <button
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:bg-teal-50 transition-colors cursor-pointer"
      onClick={() => setActiveTab("bookings")}
      aria-label="View total bookings"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {bookings?.length ?? 0}
          </h3>
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <Calendar className="h-6 w-6 text-teal-600" />
        </div>
      </div>
    </button>
  </div>
);

export default StatsOverview;
