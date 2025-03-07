import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import CitySection from "../components/home/CitySection";
import Features from "../components/home/Features";
import Footer from "../components/Footer";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const heroImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const listingType = searchParams.get("listing") || "all";
  const propertyType = searchParams.get("type") || "all";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:3000/api/listings/listings?type=${propertyType}&listingType=${listingType}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Log fetched data for debugging

        // Map the fetched data to match the expected frontend format
        const mappedProperties = data.map((listing) => ({
          id: listing._id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceUnit: listing.rentOrSale === "Rent" ? "monthly" : "total",
          address: listing.address, // Use the address object directly from the backend
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          images: listing.imageUrls,
          type: listing.listingType.toLowerCase(),
          listingType: listing.rentOrSale.toLowerCase(),
          features: [], // Add features if available
          amenities: listing.amenities || [], // Use amenities from the backend
          isFeatured: false, // Add isFeatured if available
          isNew:
            new Date(listing.createdAt).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000, // New listings are less than 30 days old
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          agent: {
            id: listing.userRef,
            name: "Agent Name", // Add agent name if available
            photo: "https://randomuser.me/api/portraits/men/1.jpg", // Add agent photo if available
            phone: "555-123-4567", // Add agent phone if available
            email: "agent@example.com", // Add agent email if available
          },
        }));

        // Set the mapped properties to the state
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [listingType, propertyType]);

  useEffect(() => {
    // Set initial image as loaded
    const img = new Image();
    img.src = heroImages[0];
    img.onload = () => setIsLoaded(true);

    // Change image every 6 seconds
    const interval = setInterval(() => {
      setIsLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % heroImages.length
        );
        const nextImg = new Image();
        nextImg.src = heroImages[(currentImageIndex + 1) % heroImages.length];
        nextImg.onload = () => setIsLoaded(true);
      }, 400); // Short delay for fade-out effect
    }, 6000);

    return () => clearInterval(interval);
  }, [currentImageIndex]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="bg-gray-100 scroll-smooth md:scroll-auto">
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background image with parallax effect */}
        <div className="absolute inset-0">
          {heroImages.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-700 ${
                index === currentImageIndex
                  ? isLoaded
                    ? "opacity-100"
                    : "opacity-0"
                  : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        <button className="relative z-10 bg-teal-500 text-white px-4 py-2 rounded-2xl mb-4">
          Stay happy
        </button>
        <h2 className="relative z-10 text-4xl md:text-5xl font-bold text-white">
          Find Your Dream Home, Effortlessly.
        </h2>
        <div className="relative z-10 flex space-x-4 mt-4">
          <button className="border-b-2 border-white text-white cursor-pointer">
            Sale
          </button>
          <button className="text-white cursor-pointer">Rent</button>
        </div>

        {/* Improved Responsive Search Bar - 70% width on small screens */}
        <div className="relative z-10 w-4/5 sm:w-[70%] md:w-4/5 lg:w-3/4 mx-auto mt-8">
          <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden transition-all">
            {/* Mobile View: Stacked Layout */}
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Search Input */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Enter Name, Keywords..."
                  className="w-full p-4 pl-12 outline-none"
                  value={formData.name}
                  onChange={handleChange}
                  id="name"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <select
                  id="type"
                  className="w-full p-4 appearance-none outline-none bg-transparent"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <select
                  id="location"
                  className="w-full p-4 appearance-none outline-none bg-transparent"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">Location</option>
                  <option value="kathmandu">Kathmandu</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <button className="bg-teal-500 hover:bg-teal-600 text-white font-medium p-4 md:px-8 transition-colors w-full md:w-auto flex items-center justify-center">
                <span className="mr-2">Search</span>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Explore our handpicked selection of featured properties.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/properties">
                View all properties <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
            <PropertyGrid properties={properties} />
          </div>
        </div>
      </section>
      <CitySection />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
