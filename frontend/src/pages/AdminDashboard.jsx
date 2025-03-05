import { useState } from "react";
import {
  Building,
  Users,
  Home,
  Settings,
  Package,
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Properties",
      value: "103",
      icon: <Building className="h-5 w-5 text-purple-500" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Users",
      value: "2,340",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Properties Sold",
      value: "43",
      icon: <Home className="h-5 w-5 text-orange-500" />,
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
        <h2 className="text-xl font-bold text-purple-700 flex items-center mb-6">
          <Building className="mr-2 h-5 w-5" />
          HomeFinder Admin
        </h2>
        <nav className="flex-1 space-y-2">
          <a
            href="#"
            className="flex items-center p-3 text-gray-700 rounded-lg bg-purple-50 text-purple-700"
          >
            <Package className="h-5 w-5 mr-3" /> Dashboard
          </a>
          <a
            href="#"
            className="flex items-center p-3 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <Home className="h-5 w-5 mr-3" /> Properties
          </a>
          <a
            href="#"
            className="flex items-center p-3 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <Users className="h-5 w-5 mr-3" /> Users
          </a>
          <a
            href="#"
            className="flex items-center p-3 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <Settings className="h-5 w-5 mr-3" /> Settings
          </a>
        </nav>
        <div className="p-4 border-t">
          <a
            href="/"
            className="flex items-center text-sm text-gray-600 hover:text-purple-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Website
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Manage your properties, users, and settings in one place
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-shadow p-6 bg-white rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">{stat.title}</span>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
