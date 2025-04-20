import React from "react";
import { Home, Users, Building, Calendar } from "lucide-react";

const StatsOverview = ({ properties, users, bookings }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Properties</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {properties.length}
          </h3>
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <Home className="h-6 w-6 text-teal-500" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Active Users</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {users.length}
          </h3>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <Users className="h-6 w-6 text-green-500" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {bookings.length}
          </h3>
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <Calendar className="h-6 w-6 text-purple-500" />
        </div>
      </div>
    </div>
  </div>
);

export default StatsOverview;
