// src/components/admin/MovingServicesTab.jsx
import React, { useState, useEffect } from "react";
import { Plus, Package, Search } from "lucide-react";

const MovingServicesTab = () => {
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

  // Fetch all moving services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/moving-services", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setServices(data);
          setFilteredServices(data); // Initialize filtered list
        } else {
          setError(data.message || "Failed to fetch services");
        }
      } catch (err) {
        setError("Error fetching services");
      }
    };
    fetchServices();
  }, []);

  // Filter services by city
  useEffect(() => {
    if (!searchCity.trim()) {
      setFilteredServices(services);
    } else {
      const lowerSearch = searchCity.toLowerCase();
      setFilteredServices(
        services.filter((service) =>
          service.locations.some((loc) =>
            loc.toLowerCase().includes(lowerSearch)
          )
        )
      );
    }
  }, [searchCity, services]);

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

    // Validate form
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
      const res = await fetch("/api/moving-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      } else {
        setError(data.message || "Failed to add service");
      }
    } catch (err) {
      setError("Error adding service");
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

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Package className="h-6 w-6 mr-2 text-gray-600" />
        Moving Services
      </h2>

      <div className="space-y-6">
        {/* Add Service Form Section */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add New Moving Service
            </h3>
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
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Locations (comma-separated)
                </label>
                <input
                  type="text"
                  name="locations"
                  value={formData.locations}
                  onChange={handleInputChange}
                  placeholder="E.g., Kathmandu, Bhaktapur, Pokhara"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Services Offered (comma-separated)
                </label>
                <input
                  type="text"
                  name="servicesOffered"
                  value={formData.servicesOffered}
                  onChange={handleInputChange}
                  placeholder="E.g., Packing, Transport, Unpacking"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Service"}
                </button>
                <button
                  type="button"
                  onClick={toggleAddForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Services Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              All Moving Services
            </h3>
            {!isAdding && (
              <button
                onClick={toggleAddForm}
                className="flex items-center text-sm font-medium text-white bg-blue-500 py-1.5 px-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                disabled={loading}
                aria-label="Add new service"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Service
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchCity}
                onChange={handleSearchChange}
                placeholder="Search by city (e.g., Kathmandu)"
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {searchCity
                ? "No services found for this city."
                : "No moving services added yet."}
            </p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-5 gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-sm text-gray-600">{service.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Contact
                      </p>
                      <p className="text-sm text-gray-600">
                        {service.contact.phone} |{" "}
                        <a
                          href={`mailto:${service.contact.email}`}
                          className="text-blue-500 hover:underline"
                        >
                          {service.contact.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Locations
                      </p>
                      <p className="text-sm text-gray-600">
                        {service.locations.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Description
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {service.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Services Offered
                      </p>
                      <p className="text-sm text-gray-600">
                        {service.servicesOffered.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovingServicesTab;
