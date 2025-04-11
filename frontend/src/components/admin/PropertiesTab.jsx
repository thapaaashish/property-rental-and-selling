// src/components/admin/PropertiesTab.jsx
import React from "react";
import { Home } from "lucide-react";

const PropertiesTab = ({
  properties,
  handleDeleteProperty,
  actionLoading,
  navigate,
}) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Properties</h2>
        <button
          onClick={() => navigate("/create-listing")}
          className="flex items-center text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New
        </button>
      </div>
      {properties.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-600 mb-4">
            There are no properties in the system yet.
          </p>
          <button
            onClick={() => navigate("/create-listing")}
            className="text-sm font-medium text-white bg-teal-500 py-2 px-4 rounded-lg hover:bg-teal-400"
          >
            Create a Property
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property._id}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                        {property.imageUrls?.length > 0 ? (
                          <img
                            src={property.imageUrls[0]}
                            alt={property.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48?text=No+Image"; // Fallback image
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Home className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} BD · {property.bathrooms} BA ·{" "}
                          {property.area} sqft
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.rentOrSale === "Sale"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {property.rentOrSale}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    ${property.price}
                    {property.rentOrSale === "Rent" && "/mo"}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {formatDate(property.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/edit-listing/${property._id}`)
                        }
                        className="text-teal-500 hover:text-teal-600"
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        className="text-red-500 hover:text-red-600"
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
