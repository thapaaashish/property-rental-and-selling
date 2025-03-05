import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Share2,
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
} from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); // State for active tab

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:3000/backend/listings/listings/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to fetch property details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h3 className="text-xl font-semibold text-red-500">{error}</h3>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h3 className="text-xl font-semibold">Property not found.</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 mt-15">
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
        {/* Left Column (Property Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <div className="relative">
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <img
                src={property.imageUrls[0] || "/placeholder.svg"}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-4 top-4 flex space-x-2">
              <button className="rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white hover:text-blue-600">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white hover:text-red-600">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Property Title and Price */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>
                    {property.address?.street}, {property.address?.city},{" "}
                    {property.address?.state}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${property.price.toLocaleString()}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    property.rentOrSale === "Sale"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {property.rentOrSale === "Sale" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
              <div className="flex flex-col items-center justify-center">
                <Bed className="mb-1 h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">
                  {property.bedrooms} Bedrooms
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Bath className="mb-1 h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">
                  {property.bathrooms} Bathrooms
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Square className="mb-1 h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">
                  {property.area} sq ft
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex space-x-4 border-b">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === "description"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === "features"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("features")}
              >
                Features
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === "location"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("location")}
              >
                Location
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "description" && (
              <div className="p-4 border rounded-lg mt-4">
                <p className="text-gray-700">{property.description}</p>
              </div>
            )}

            {activeTab === "features" && (
              <div className="p-4 border rounded-lg mt-4">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "location" && (
              <div className="p-4 border rounded-lg mt-4">
                <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                  <div className="h-full w-full flex items-center justify-center text-gray-500">
                    Map view would be displayed here
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">Nearby Amenities</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                      Schools within 1 mile
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                      Shopping centers within 2 miles
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                      Public transportation within 0.5 miles
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                      Parks and recreation within 1 mile
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Agent and Contact Form) */}
        <div className="space-y-6">
          {/* Agent Card */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="font-medium">JD</span>
              </div>
              <div>
                <h3 className="font-medium">John Doe</h3>
                <p className="text-sm text-gray-500">Real Estate Agent</p>
              </div>
            </div>
            <div className="py-4 space-y-4">
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <span>(123) 456-7890</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <span>john.doe@example.com</span>
              </div>
            </div>
            <div className="pt-4 border-t space-y-2">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Contact Agent
              </button>
              <button className="w-full bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100">
                Schedule Viewing
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-4">Request Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    className="w-full p-2 border rounded-md"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    className="w-full p-2 border rounded-md"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full p-2 border rounded-md"
                  placeholder="I'm interested in this property..."
                />
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
