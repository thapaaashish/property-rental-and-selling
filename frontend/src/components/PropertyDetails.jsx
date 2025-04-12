import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Home,
  List,
  Map,
  Heart,
  Share2,
  Calendar,
  DollarSign,
} from "lucide-react";
import AddToWishlist from "../components/AddToWishlist";
import ShareButton from "../components/Share/ShareButton";
import GoogleMapComponent from "./GoogleMap";
import BookingForm from "../components/user/Booking";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPropertyAndAgent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/listings/listings/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const propertyData = await response.json();
        setProperty(propertyData);
        if (propertyData.agent) {
          setAgent(propertyData.agent);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch property details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyAndAgent();
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

  const getAgentInitials = () => {
    if (!agent || !agent.fullname) return "AG";
    const nameParts = agent.fullname.split(" ");
    return nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameParts[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm text-center border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
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
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm text-center border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Property Not Found
          </h3>
          <p className="text-gray-600">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const [lng, lat] = property.location.coordinates;
  const agentName = agent?.fullname || "Agent Information";
  const agentRole = "Real Estate Agent";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center text-sm text-gray-500">
          <a href="/" className="hover:text-gray-900 flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/listings" className="hover:text-gray-900">
            Listings
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {property.title}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-lg overflow-hidden bg-white border border-gray-200">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={
                    property.imageUrls[currentImageIndex] || "/placeholder.svg"
                  }
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {property.imageUrls?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-sm hover:bg-white transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-sm hover:bg-white transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {property.imageUrls?.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {property.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-gray-900"
                          : "bg-gray-400"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="absolute right-4 top-4 flex space-x-2">
                <ShareButton property={property} />
                <AddToWishlist propertyId={property._id} />
              </div>

              <div className="absolute left-4 top-4">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${
                    property.rentOrSale === "Sale"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {property.rentOrSale === "Sale" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </div>

            {/* Property Header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {property.title}
                  </h1>
                  <div className="flex items-center mt-1 text-gray-600">
                    <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="text-sm">
                      {property.address?.street}, {property.address?.city},{" "}
                      {property.address?.state}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-semibold text-gray-900">
                    ${property.price.toLocaleString()}
                  </p>
                  {property.rentOrSale === "Rent" && (
                    <p className="text-gray-500 text-xs">per month</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center p-3 rounded-md border border-gray-200">
                  <Bed className="h-5 w-5 text-gray-700" />
                  <span className="mt-1 text-sm font-medium text-gray-900">
                    {property.bedrooms}
                  </span>
                  <span className="text-xs text-gray-500">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-md border border-gray-200">
                  <Bath className="h-5 w-5 text-gray-700" />
                  <span className="mt-1 text-sm font-medium text-gray-900">
                    {property.bathrooms}
                  </span>
                  <span className="text-xs text-gray-500">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-md border border-gray-200">
                  <Square className="h-5 w-5 text-gray-700" />
                  <span className="mt-1 text-sm font-medium text-gray-900">
                    {property.area}
                  </span>
                  <span className="text-xs text-gray-500">sq ft</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === "description"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === "features"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === "location"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Location
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "description" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Property Details
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {activeTab === "features" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Amenities & Features
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <li
                          key={index}
                          className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                          <span className="text-gray-700 text-sm">
                            {amenity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "location" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Location Details
                    </h3>
                    <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100 mb-4 border border-gray-200">
                      <GoogleMapComponent lat={lat} lng={lng} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-md font-medium text-gray-900">
                        Nearby Amenities
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <li className="flex items-center p-2 rounded-md border border-gray-200">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                          <span className="text-gray-700 text-sm">
                            Schools within 1 mile
                          </span>
                        </li>
                        <li className="flex items-center p-2 rounded-md border border-gray-200">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                          <span className="text-gray-700 text-sm">
                            Shopping centers within 2 miles
                          </span>
                        </li>
                        <li className="flex items-center p-2 rounded-md border border-gray-200">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                          <span className="text-gray-700 text-sm">
                            Public transportation within 0.5 miles
                          </span>
                        </li>
                        <li className="flex items-center p-2 rounded-md border border-gray-200">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-500" />
                          <span className="text-gray-700 text-sm">
                            Parks and recreation within 1 mile
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900">Listed By</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                  <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {agent?.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-gray-600">
                        {getAgentInitials()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{agentName}</h3>
                    <p className="text-sm text-gray-500">{agentRole}</p>
                  </div>
                </div>
                <div className="py-4 space-y-3">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {agent?.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {agent?.email || "Not provided"}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <button className=" cursor-pointer w-full bg-gray-900 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm flex justify-center items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="">
              <div className="">
                <BookingForm property={property} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
