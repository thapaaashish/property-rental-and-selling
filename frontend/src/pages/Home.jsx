import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import CitySection from "../components/home/CitySection";
import Features from "../components/home/Features";
import Footer from "../components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import FeaturedProperties from "../components/home/FeaturedProperties";
import { ArrowRight } from "lucide-react";

const heroImages = [
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414192/greg-rivers-rChFUMwAe7E-unsplash_q61ltj.jpg",
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414191/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_dynzyf.jpg",
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414191/frames-for-your-heart-mR1CIDduGLc-unsplash_hffrlb.jpg",
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const listingType = searchParams.get("listing") || "all";
  const propertyType = searchParams.get("type") || "all";
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/listings/listings?type=${propertyType}&listingType=${listingType}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setProperties(
          data.map((listing) => ({
            id: listing._id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            priceUnit: listing.rentOrSale === "Rent" ? "monthly" : "total",
            address: listing.address,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            area: listing.area,
            images: listing.imageUrls,
            type: listing.listingType.toLowerCase(),
            listingType: listing.rentOrSale.toLowerCase(),
            amenities: listing.amenities || [],
            isNew:
              new Date(listing.createdAt).getTime() >
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            agent: {
              id: listing.userRef,
              name: "Agent Name",
              photo: "https://randomuser.me/api/portraits/men/1.jpg",
              phone: "555-123-4567",
              email: "agent@example.com",
            },
          }))
        );
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [listingType, propertyType]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  return (
    <div className="bg-white">
      <section className="relative -mt-14 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImages[currentImageIndex]}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Dream Home, Effortlessly.
          </h2>
          <div className="relative w-full max-w-3xl mt-6 bg-gray-300 rounded-lg">
            <div className="bg-white shadow-md rounded-lg overflow-hidden flex m-4">
              <input
                type="text"
                id="name"
                placeholder="Enter Name, Keywords..."
                className="w-full p-4 outline-none"
                value={formData.name}
                onChange={handleChange}
              />
              <button className="bg-teal-500 p-4 m-2 rounded-lg text-white">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => {
                setIsLoaded(false);
                setTimeout(() => {
                  setCurrentImageIndex(index);
                  setIsLoaded(true);
                }, 200);
              }}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </section>
      <section className="">
        <div className="">
          {/* Property Grid */}
          <div>
            <FeaturedProperties properties={properties} />
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
