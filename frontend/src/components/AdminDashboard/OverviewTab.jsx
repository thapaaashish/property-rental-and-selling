import React, { useState, useMemo } from "react";
import {
  Home,
  Calendar,
  UserPlus,
  Users,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart2,
} from "lucide-react";
import { MapWithAllProperties } from "../GoogleMap";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import PropTypes from "prop-types";

// Constants
const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];
const MAX_TABLE_ROWS = 5;

const OverviewTab = ({
  properties = [],
  bookings = [],
  users = [],
  pendingVerifications = [],
  navigate,
  setActiveTab,
}) => {
  const [chartType, setChartType] = useState("pie");
  const [activeChartData, setActiveChartData] = useState("rentOrSale");

  // Memoized chart data
  const { rentOrSaleData, listingTypeData } = useMemo(() => {
    const rentOrSaleCount = properties.reduce((acc, property) => {
      const type = property.rentOrSale || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const listingTypeCount = properties.reduce((acc, property) => {
      const type = property.listingType || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const rentOrSaleData = Object.keys(rentOrSaleCount).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: rentOrSaleCount[key],
    }));
    const listingTypeData = Object.keys(listingTypeCount).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: listingTypeCount[key],
    }));
    return { rentOrSaleData, listingTypeData };
  }, [properties]);

  // Memoized map markers
  const mapMarkers = useMemo(() => {
    return properties
      .filter((prop) => prop.location?.coordinates?.length === 2)
      .map((property) => ({
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
        title: property.title,
      }));
  }, [properties]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Empty state
  if (
    properties.length === 0 &&
    bookings.length === 0 &&
    users.length === 0 &&
    pendingVerifications.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Yet</h2>
          <p className="text-gray-500 text-sm mb-4">
            There are no properties, bookings, users, or verifications to show.
          </p>
        </div>
      </div>
    );
  }

  // Empty state for tables
  const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-6">
      <Icon className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-gray-500 text-xs">{message}</p>
    </div>
  );

  // Avatar cell for users and verifications
  const AvatarCell = ({ src, alt, fallbackText }) => (
    <div className="h-6 w-6 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs font-medium">
          {fallbackText?.charAt(0) || "U"}
        </div>
      )}
    </div>
  );

  const currentChartData =
    activeChartData === "rentOrSale" ? rentOrSaleData : listingTypeData;

  return (
    <div className="bg-gray-50 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Properties Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Recent Properties
              </h2>
              <button
                onClick={() => setActiveTab("properties")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {properties.length === 0 ? (
              <EmptyState icon={Home} message="No properties yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">Property</th>
                      <th className="px-4 py-2 text-right">By</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Posted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {properties.slice(0, MAX_TABLE_ROWS).map((property) => (
                      <tr
                        key={property._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              {property.imageUrls?.length > 0 ? (
                                <img
                                  src={property.imageUrls[0]}
                                  alt={property.title}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <Home className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-2">
                              <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">
                                {property.title || "Untitled Property"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {property.listingType || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right truncate max-w-[100px]">
                          <p className="text-xs font-medium text-gray-800 ml-2 truncate max-w-[120px]">
                            {property.userRef?.fullname || "Unknown User"}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-800">
                            {property.price ? `Rs.${property.price}` : "N/A"}
                          </span>
                          {property.rentOrSale === "Rent" && (
                            <span className="text-xs text-gray-500 ml-1">
                              /mo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-500">
                          {formatDate(property.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Recent Bookings
              </h2>
              <button
                onClick={() => setActiveTab("bookings")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {bookings.length === 0 ? (
              <EmptyState icon={Calendar} message="No bookings yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">Booking</th>
                      <th className="px-4 py-2 text-right">User</th>
                      <th className="px-4 py-2 text-right">Payment</th>
                      <th className="px-4 py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.slice(0, MAX_TABLE_ROWS).map((booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">
                            {booking.listing?.title || "Unknown Listing"}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {booking.status || "Pending"}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-700 truncate max-w-[100px]">
                          {booking.user?.fullname || "Unknown User"}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full font-medium capitalize ${
                              booking.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : booking.paymentStatus === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap text-xs text-gray-500">
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Property Map Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Property Map
              </h2>
              <button
                onClick={() => setActiveTab("properties")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {mapMarkers.length === 0 ? (
              <EmptyState
                icon={Home}
                message="No property locations available"
              />
            ) : (
              <div className="h-64">
                <MapWithAllProperties markers={mapMarkers} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Charts and Verifications */}
        <div className="space-y-4">
          {/* Property Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Property Distribution
              </h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => setChartType("pie")}
                  className={`p-1 rounded ${
                    chartType === "pie"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  aria-label="Pie chart view"
                >
                  <PieChartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-1 rounded ${
                    chartType === "bar"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  aria-label="Bar chart view"
                >
                  <BarChart2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {properties.length === 0 ? (
              <EmptyState
                icon={PieChartIcon}
                message="No property data available"
              />
            ) : (
              <div className="p-3">
                <div className="flex justify-center mb-3">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => setActiveChartData("rentOrSale")}
                      className={`text-xs font-medium ${
                        activeChartData === "rentOrSale"
                          ? "text-blue-600 border-b-2 border-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      By Rent/Sale
                    </button>
                    <button
                      onClick={() => setActiveChartData("listingType")}
                      className={`text-xs font-medium ${
                        activeChartData === "listingType"
                          ? "text-blue-600 border-b-2 border-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      By Type
                    </button>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                      <RechartsPieChart>
                        <Pie
                          data={currentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {currentChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value} properties`,
                            "Count",
                          ]}
                        />
                      </RechartsPieChart>
                    ) : (
                      <BarChart
                        data={currentChartData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            `${value} properties`,
                            "Count",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Count"
                          fill="#0088FE"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Pending KYC Verifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Pending KYC Verifications
              </h2>
              <button
                onClick={() => setActiveTab("kyc")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {pendingVerifications.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                message="No pending verifications"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingVerifications
                      .slice(0, MAX_TABLE_ROWS)
                      .map((verification) => (
                        <tr
                          key={verification._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <AvatarCell
                                src={verification.avatar}
                                alt={verification.fullname}
                                fallbackText={verification.fullname}
                              />
                              <div className="ml-2">
                                <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                                  {verification.fullname || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                  {verification.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex text-xs px-2 py-1 rounded-full font-medium capitalize ${
                                verification.kyc?.documentType === "passport"
                                  ? "bg-blue-100 text-blue-800"
                                  : verification.kyc?.documentType ===
                                    "driver_license"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {verification.kyc?.documentType || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">New Users</h2>
              <button
                onClick={() => setActiveTab("users")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {users.length === 0 ? (
              <EmptyState icon={Users} message="No users yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.slice(0, MAX_TABLE_ROWS).map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <AvatarCell
                              src={user.avatar}
                              alt={user.fullname}
                              fallbackText={user.fullname}
                            />
                            <div className="ml-2">
                              <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                                {user.fullname || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full font-medium capitalize ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "agent"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OverviewTab.propTypes = {
  properties: PropTypes.array,
  bookings: PropTypes.array,
  users: PropTypes.array,
  pendingVerifications: PropTypes.array,
  navigate: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default OverviewTab;
