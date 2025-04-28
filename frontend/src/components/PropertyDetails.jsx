import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Home,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  User,
  Tag,
  Clock,
  Info,
  Star,
  Check,
  Truck,
  ArrowRight,
} from "lucide-react";
import AddToWishlist from "../components/AddToWishlist";
import ShareButton from "../components/Share/ShareButton";
import GoogleMapComponent from "./GoogleMap";
import BookingForm from "../components/user/Booking";
import {
  MovingServicesCardSmall,
  MovingServicePopup,
} from "../components/MovingServicesCard";
import PropertyReviews from "./PropertyReviews";
import Popup from "../components/common/Popup";
import StartChatButton from "../components/StartChatButton";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [movingServices, setMovingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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
        setError(
          error.message ||
            "Failed to fetch property details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyAndAgent();
  }, [id]);

  useEffect(() => {
    const fetchMovingServices = async () => {
      if (!property?.address?.city) return;
      try {
        const res = await fetch("/api/moving-services/public", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          const city = property.address.city.toLowerCase();
          const filteredServices = data.filter((service) =>
            service.locations.some((loc) => loc.toLowerCase() === city)
          );
          setMovingServices(filteredServices);
        } else {
          console.error("Failed to fetch moving services:", data.message);
        }
      } catch (err) {
        console.error("Error fetching moving services:", err);
      }
    };

    fetchMovingServices();
  }, [property?.address?.city]);

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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

        {/* Header with image */}
        <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200 mb-8 shadow-sm">
          <div className="aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/9] min-h-[250px] sm:min-h-[400px] overflow-hidden">
            <img
              src={
                property.imageUrls[currentImageIndex] ||
                "https://via.placeholder.com/800x400?text=No+Image+Available"
              }
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>
          {property.imageUrls?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-md hover:bg-white transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-md hover:bg-white transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {property.imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white border border-gray-300 scale-125"
                        : "bg-gray-300/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute right-4 top-4 flex space-x-2">
            <ShareButton property={property} />
            <AddToWishlist propertyId={property._id} />
          </div>
          <div className="absolute left-4 top-4">
            <span
              className={`inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${
                property.rentOrSale === "Sale"
                  ? "bg-blue-600 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {property.rentOrSale === "Sale" ? "For Sale" : "For Rent"}
            </span>
          </div>

          {/* Property Quick Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-transparent p-4 sm:p-6 text-white">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 truncate">
              {property.title}
            </h1>
            <div className="flex items-center mb-2 sm:mb-3">
              <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">
                {property.address?.street}, {property.address?.city},{" "}
                {property.address?.state}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center">
                <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">
                  {property.bedrooms} Beds
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">
                  {property.bathrooms} Baths
                </span>
              </div>
              <div className="flex items-center">
                <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">
                  {property.area} sq ft
                </span>
              </div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">
                  {new Intl.NumberFormat("en-NP", {
                    style: "currency",
                    currency: "NPR",
                  }).format(property.price)}
                </span>
                {property.rentOrSale === "Rent" && (
                  <span className="ml-1 text-xs sm:text-sm opacity-80">
                    /month
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-6 py-3 text-sm font-medium flex-1 text-center ${
                    activeTab === "details"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-selected={activeTab === "details"}
                  role="tab"
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`px-6 py-3 text-sm font-medium flex-1 text-center ${
                    activeTab === "features"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-selected={activeTab === "features"}
                  role="tab"
                >
                  Features & Amenities
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  className={`px-6 py-3 text-sm font-medium flex-1 text-center ${
                    activeTab === "location"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-selected={activeTab === "location"}
                  role="tab"
                >
                  Location
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "details" && (
                  <section aria-labelledby="description-heading">
                    <div className="flex items-center mb-4">
                      <Info className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Property Description
                      </h2>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-gray-800 font-semibold text-lg">
                          {property.title}
                        </h2>
                        <span className="text-gray-900 font-bold text-lg">
                          Rs {property.price}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-2">
                        {property.description}
                      </p>
                    </div>

                    <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h3 className="text-md font-medium text-blue-800 mb-2">
                        Property Highlights
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-800 text-sm">
                            Built in {property.yearBuilt || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-800 text-sm">
                            {property.propertyType || "Residential"} Property
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-800 text-sm">
                            Available {property.availableFrom || "Now"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-gray-600 mr-2" />
                          <h3 className="text-md font-medium text-gray-800">
                            Listed on
                          </h3>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {new Date(
                            property.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === "features" && (
                  <section aria-labelledby="features-heading">
                    <div className="flex items-center mb-6">
                      <Star className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Amenities & Features
                      </h2>
                    </div>
                    {property.amenities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="mr-3 h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-gray-800">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No amenities listed for this property.
                      </p>
                    )}
                  </section>
                )}

                {activeTab === "location" && (
                  <section aria-labelledby="location-heading">
                    <div className="flex items-center mb-4">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Property Location
                      </h2>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-6">
                      <GoogleMapComponent lat={lat} lng={lng} />
                    </div>
                    {property.nearbyAmenities ? (
                      <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3">
                          Nearby Amenities
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {property.nearbyAmenities
                            .split("\n")
                            .filter((amenity) => amenity.trim() !== "")
                            .map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 rounded-md bg-gray-50 border border-gray-200"
                              >
                                <div className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-gray-800 text-sm">
                                  {amenity.trim()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3">
                          Nearby Amenities
                        </h3>
                        <p className="text-gray-600">
                          No nearby amenities listed for this property.
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <PropertyReviews
              propertyId={property._id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8">
            {/* Agent Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900">Listed By</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                  <div className="h-14 w-14 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {agent?.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-gray-600 text-lg">
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
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <StartChatButton
                    receiverId={agent?._id}
                    receiverEmail={agent?.email}
                    extraClassName="w-full bg-blue-600 text-white"
                  />
                  <button
                    className="w-full bg-gray-100 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm flex justify-center items-center"
                    onClick={() => navigate(`/user/${agent?._id}`)}
                    disabled={!agent?._id}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden ring-2 ring-blue-300/50">
              <div className="px-4 py-3 border-b border-blue-200 bg-blue-50">
                <h3 className="font-medium text-blue-900">
                  Schedule a Viewing
                </h3>
              </div>
              <div className="p-6">
                <BookingForm property={property} />
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900">Property Facts</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Property Type</span>
                    <span className="font-medium text-gray-900">
                      {property.propertyType || "Residential"}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Year Built</span>
                    <span className="font-medium text-gray-900">
                      {property.yearBuilt || "N/A"}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">
                      Available From
                    </span>
                    <span className="font-medium text-gray-900">
                      {property.availableFrom || "Immediate"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Moving Services Full Section */}
        {property.address?.city && movingServices.length > 0 && (
          <section
            id="moving-services-section"
            className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              Moving Services in {property.address.city}
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movingServices.map((service) => (
                <div
                  key={service._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Serves {service.locations.join(", ")}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    View details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedService && (
          <MovingServicePopup
            {...selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}

        {showChatPopup && (
          <Popup
            message="Conversation started!"
            type="success"
            duration={3000}
            onClose={() => setShowChatPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
