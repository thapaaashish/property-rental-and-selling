import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import AddToWishlist from "../components/AddToWishlist";
import GoogleMapComponent from "./GoogleMap";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPropertyAndAgent = async () => {
      setLoading(true);
      setError(null);
      try {
        const propertyResponse = await fetch(`/api/listings/listings/${id}`);
        if (!propertyResponse.ok) {
          throw new Error(`HTTP error! Status: ${propertyResponse.status}`);
        }
        const propertyData = await propertyResponse.json();
        setProperty(propertyData);
        if (propertyData.agent) {
          setAgent(propertyData.agent);
        } else {
          console.log("No Agent Data Found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch property details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyAndAgent();
    }
  }, [id]);

  const nextImage = () => {
    if (property?.imageUrls?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === property.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.imageUrls?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.imageUrls.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Property Not Found</h3>
          <p className="text-gray-600">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const getAgentInitials = () => {
    if (!agent || !agent.fullname) return "AG";
    const nameParts = agent.fullname.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    } else {
      return "AG";
    }
  };

  const agentName = agent?.fullname || "Agent Information";
  const agentRole = "Real Estate Agent";

  // Extract lat and lng from property.location.coordinates
  const [lng, lat] = property.location.coordinates;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <a href="/" className="hover:text-blue-600">
            Home
          </a>
          <span className="mx-2">›</span>
          <a href="/listings" className="hover:text-blue-600">
            Listings
          </a>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{property.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left Column (Property Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images Gallery */}
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={
                    property.imageUrls[currentImageIndex] || "/placeholder.svg"
                  }
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {property.imageUrls?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-gray-800 shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-gray-800 shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {property.imageUrls?.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {property.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="absolute right-4 top-4 flex space-x-2">
                <button className="rounded-full bg-white/80 p-2.5 shadow-md text-gray-600 hover:bg-white hover:text-blue-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <AddToWishlist propertyId={property._id} />
              </div>

              <div className="absolute left-4 top-4">
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full shadow-md ${
                    property.rentOrSale === "Sale"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {property.rentOrSale === "Sale" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </div>

            {/* Property Title and Price */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {property.title}
                  </h1>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>
                      {property.address?.street}, {property.address?.city},{" "}
                      {property.address?.state}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    ${property.price.toLocaleString()}
                  </p>
                  {property.rentOrSale === "Rent" && (
                    <p className="text-gray-600 text-sm">per month</p>
                  )}
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-1 mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <Bed className="mb-2 h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {property.bedrooms}
                  </span>
                  <span className="text-xs text-gray-600">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <Bath className="mb-2 h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {property.bathrooms}
                  </span>
                  <span className="text-xs text-gray-600">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <Square className="mb-2 h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {property.area}
                  </span>
                  <span className="text-xs text-gray-600">sq ft</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Description
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Property Features
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {property.amenities.map((amenity, index) => (
                  <li
                    key={index}
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Location
              </h3>
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gray-100 mb-6">
                {/* Pass lat and lng to GoogleMapComponent */}
                <GoogleMapComponent lat={lat} lng={lng} />
              </div>
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900">
                  Nearby Amenities
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-center p-2 bg-blue-50 rounded-md">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">Schools within 1 mile</span>
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded-md">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">
                      Shopping centers within 2 miles
                    </span>
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded-md">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">
                      Public transportation within 0.5 miles
                    </span>
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded-md">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">
                      Parks and recreation within 1 mile
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Agent and Contact Form) */}
          <div className="space-y-8">
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-teal-500 px-6 py-4 text-white">
                <h3 className="font-semibold">Listed By</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-gray-100 border-2 border-teal-500 flex items-center justify-center overflow-hidden">
                    {agent?.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-lg">
                        {getAgentInitials()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{agentName}</h3>
                    <p className="text-sm text-gray-600">{agentRole}</p>
                  </div>
                </div>
                <div className="py-4 space-y-4">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <Phone className="mr-3 h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 truncate">
                      {agent?.phone || "Contact information unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <Mail className="mr-3 h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 truncate">
                      {agent?.email || "Email unavailable"}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <button className="w-full bg-teal-500 cursor-pointer text-white font-medium px-4 py-3 rounded-md hover:bg-teal-700 transition-colors flex justify-center items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send message
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button className="w-full bg-teal-500 cursor-pointer text-white font-medium px-4 py-3 rounded-md hover:bg-teal-700 transition-colors flex justify-center items-center">
                Pay Now with Esewa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
