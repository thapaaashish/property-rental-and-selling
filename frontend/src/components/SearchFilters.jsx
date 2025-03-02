import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import { Search, Sliders, X } from 'lucide-react';

const SearchFilters = ({ onFilter, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: 'sale',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    location: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const resetFilters = () => {
    setFilters({
      type: 'sale',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      location: ''
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-6">
          {/* Main search row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Enter city, zip, or address"
                  value={filters.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex md:w-auto">
              <button type="button" className="flex-1 md:flex-none border border-gray-300 rounded-lg p-2" onClick={() => setIsExpanded(!isExpanded)}>
                <Sliders className="h-4 w-4 mr-2" />
                {isExpanded ? 'Less Filters' : 'More Filters'}
              </button>
              
              <button type="submit" className="ml-2 flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2">
                Search
              </button>
            </div>
          </div>
          
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
            <div className="flex rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  filters.type === 'sale'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTypeChange('sale')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  filters.type === 'rent'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleTypeChange('rent')}
              >
                Rent
              </button>
            </div>
          </div>
          
          {/* Extended filters */}
          {isExpanded && (
            <div className="pt-2 animate-fade-in border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="villa">Villa</option>
                    <option value="office">Office</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="priceMin"
                      name="priceMin"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      id="priceMax"
                      name="priceMax"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

SearchFilters.propTypes = {
  onFilter: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default SearchFilters;
