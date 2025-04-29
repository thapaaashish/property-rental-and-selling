import React, { useState, useEffect, useCallback } from "react";
import { Plus, Package, Search, Trash2, Edit, X } from "lucide-react";
import Popup from "../common/Popup";
import DeleteConfirmation from "../common/DeleteConfirmation";
import debounce from "lodash.debounce";

const API_BASE = import.meta.env.VITE_API_URL;

const MovingServicesTab = ({ navigate, actionLoading, setApiError }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    locations: "",
    description: "",
    servicesOffered: "",
  });
  const [searchCity, setSearchCity] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/moving-services`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          setServices(data);
          setFilteredServices(data);
        } else {
          setPopupMessage(data.message || "Failed to fetch services");
          setPopupType("error");
          setShowPopup(true);
        }
      } catch (err) {
        setPopupMessage("Error fetching services");
        setPopupType("error");
        setShowPopup(true);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Debounced search
  const debouncedFilter = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setFilteredServices(services);
      } else {
        const lowerSearch = query.toLowerCase();
        setFilteredServices(
          services.filter((service) =>
            service.locations.some((loc) =>
              loc.toLowerCase().includes(lowerSearch)
            )
          )
        );
      }
    }, 300),
    [services]
  );

  useEffect(() => {
    debouncedFilter(searchCity);
  }, [searchCity, debouncedFilter]);

  // Sorting
  useEffect(() => {
    const sortedServices = [...filteredServices].sort((a, b) => {
      let aValue =
        sortConfig.key === "locations"
          ? a.locations.join(", ")
          : a[sortConfig.key];
      let bValue =
        sortConfig.key === "locations"
          ? b.locations.join(", ")
          : b[sortConfig.key];
      aValue = aValue?.toLowerCase() || "";
      bValue = bValue?.toLowerCase() || "";
      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
    setFilteredServices(sortedServices);
  }, [sortConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchCity(e.target.value);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.locations ||
      !formData.description ||
      !formData.servicesOffered
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/moving-services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          contact: { phone: formData.phone, email: formData.email },
          locations: formData.locations.split(",").map((loc) => loc.trim()),
          description: formData.description,
          servicesOffered: formData.servicesOffered
            .split(",")
            .map((service) => service.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const newService = data.service;
        setServices((prev) => [...prev, newService]);
        setFilteredServices((prev) =>
          searchCity.trim() &&
          !newService.locations.some((loc) =>
            loc.toLowerCase().includes(searchCity.toLowerCase())
          )
            ? prev
            : [...prev, newService]
        );
        setFormData({
          name: "",
          phone: "",
          email: "",
          locations: "",
          description: "",
          servicesOffered: "",
        });
        setIsAdding(false);
        setPopupMessage("Service added successfully!");
        setPopupType("success");
        setShowPopup(true);
      } else {
        setError(data.message || "Failed to add service");
      }
    } catch (err) {
      setError("Error adding service");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/moving-services/${serviceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) =>
          prev.filter((service) => service._id !== serviceId)
        );
        setFilteredServices((prev) =>
          prev.filter((service) => service._id !== serviceId)
        );
        setPopupMessage("Service deleted successfully!");
        setPopupType("success");
        setShowPopup(true);
      } else {
        setPopupMessage(data.message || "Failed to delete service");
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (err) {
      setPopupMessage("Error deleting service");
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddForm = () => {
    setIsAdding((prev) => !prev);
    setError(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      locations: "",
      description: "",
      servicesOffered: "",
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Package className="h-6 w-6 mr-2 text-teal-600" />
        Moving Services
      </h2>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchCity}
            onChange={handleSearchChange}
            placeholder="Search by city (e.g., Kathmandu)"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        <button
          onClick={toggleAddForm}
          className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 disabled:bg-teal-300 transition-colors text-sm font-medium"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {searchCity
                ? "No services found for this city."
                : "No moving services added yet."}
            </p>
            {!searchCity && (
              <button
                onClick={toggleAddForm}
                className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Add your first service
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-gray-700 uppercase tracking-wider">
                <tr>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name{" "}
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort("locations")}
                  >
                    Locations{" "}
                    {sortConfig.key === "locations" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Services Offered</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-teal-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {service.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">
                        {service.contact.phone}
                        <br />
                        <a
                          href={`mailto:${service.contact.email}`}
                          className="text-teal-600 hover:underline"
                        >
                          {service.contact.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {service.locations.join(", ")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                      {service.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {service.servicesOffered.join(", ")}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <DeleteConfirmation
                        itemName="service"
                        onDelete={() => handleDeleteService(service._id)}
                        disabled={actionLoading || loading}
                        className="text-red-600 hover:text-red-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {isAdding && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Moving Service
              </h3>
              <button
                onClick={toggleAddForm}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="E.g., Swift Movers"
                  className={`mt-1 w-full p-2 border ${
                    error && !formData.name
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="E.g., +1-555-123-4567"
                    className={`mt-1 w-full p-2 border ${
                      error && !formData.phone
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E.g., contact@example.com"
                    className={`mt-1 w-full p-2 border ${
                      error && !formData.email
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Locations (comma-separated)
                  <span
                    className="ml-1 text-gray-500 text-xs"
                    title="Enter cities separated by commas"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="text"
                  name="locations"
                  value={formData.locations}
                  onChange={handleInputChange}
                  placeholder="E.g., Kathmandu, Bhaktapur, Pokhara"
                  className={`mt-1 w-full p-2 border ${
                    error && !formData.locations
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="E.g., Reliable and affordable moving services..."
                  className={`mt-1 w-full p-2 border ${
                    error && !formData.description
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Services Offered (comma-separated)
                  <span
                    className="ml-1 text-gray-500 text-xs"
                    title="Enter services separated by commas"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="text"
                  name="servicesOffered"
                  value={formData.servicesOffered}
                  onChange={handleInputChange}
                  placeholder="E.g., Packing, Transport, Unpacking"
                  className={`mt-1 w-full p-2 border ${
                    error && !formData.servicesOffered
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Service"}
                </button>
                <button
                  type="button"
                  onClick={toggleAddForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovingServicesTab;
