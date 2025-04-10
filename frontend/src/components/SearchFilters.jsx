import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, Sliders, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const SearchFilters = ({ onFilter, className = "" }) => {
  const [searchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get("listingType")?.toLowerCase() || "all", // Align with URL params
    propertyType: searchParams.get("type")?.toLowerCase() || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    location: searchParams.get("location") || "",
  });

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const processedFilters = {
        ...filters,
        priceMin: filters.priceMin ? parseInt(filters.priceMin, 10) : "",
        priceMax: filters.priceMax ? parseInt(filters.priceMax, 10) : "",
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms, 10) : "",
        bathrooms: filters.bathrooms ? parseInt(filters.bathrooms, 10) : "",
      };
      console.log("Filters sent to onFilter:", processedFilters);
      onFilter(processedFilters);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [filters, onFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["priceMin", "priceMax"].includes(name)) {
      if (value === "" || /^\d*$/.test(value)) {
        setFilters((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (type) => {
    console.log("Type changed to:", type);
    setFilters((prev) => ({ ...prev, type }));
  };

  const resetFilters = () => {
    setFilters({
      type: "all",
      propertyType: "",
      priceMin: "",
      priceMax: "",
      bedrooms: "",
      bathrooms: "",
      location: "",
    });
    setIsExpanded(false);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 transition-all duration-300 ${className}`}
    >
      <div aria-label="Property Search Filters">
        <div className="flex flex-col space-y-4">
          {/* Main search row */}
          <div className="flex flex-col md:flex-row gap-2 items-end">
            <div className="flex-1 w-full">
              <label
                htmlFor="location"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="City, address"
                  value={filters.location}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  aria-label="Search by location"
                />
                <Search
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                aria-expanded={isExpanded}
                aria-controls="advanced-filters"
              >
                <Sliders className="h-3 w-3 mr-1" aria-hidden="true" />
                {isExpanded ? "Hide" : "Filters"}
              </button>
            </div>
          </div>

          {/* Type selector */}
          <div>
            <label
              className="block text-xs font-medium text-gray-700 mb-1"
              id="type-label"
            >
              Type
            </label>
            <div
              className="flex rounded-md border border-gray-200 p-0.5 bg-gray-50"
              role="radiogroup"
              aria-labelledby="type-label"
            >
              <button
                type="button"
                className={`flex-1 py-1 px-3 text-xs font-medium rounded-sm transition-colors duration-200 ${
                  filters.type === "all"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleTypeChange("all")}
                aria-checked={filters.type === "all"}
                role="radio"
              >
                All
              </button>
              <button
                type="button"
                className={`flex-1 py-1 px-3 text-xs font-medium rounded-sm transition-colors duration-200 ${
                  filters.type === "sale"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleTypeChange("sale")}
                aria-checked={filters.type === "sale"}
                role="radio"
              >
                For Sale
              </button>
              <button
                type="button"
                className={`flex-1 py-1 px-3 text-xs font-medium rounded-sm transition-colors duration-200 ${
                  filters.type === "rent"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleTypeChange("rent")}
                aria-checked={filters.type === "rent"}
                role="radio"
              >
                For Rent
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {isExpanded && (
            <div
              id="advanced-filters"
              className="pt-2 border-t border-gray-100 animate-fade-in"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label
                    htmlFor="propertyType"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Property
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    aria-label="Select property type"
                  >
                    <option value="">Any</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="room">Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      id="priceMin"
                      name="priceMin"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Minimum price"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      id="priceMax"
                      name="priceMax"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="bedrooms"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Beds
                  </label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    aria-label="Select number of bedrooms"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bathrooms"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Baths
                  </label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    aria-label="Select number of bathrooms"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <X className="h-3 w-3 mr-1" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchFilters.propTypes = {
  onFilter: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SearchFilters;
