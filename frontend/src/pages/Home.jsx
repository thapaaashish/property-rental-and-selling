import React, { useState, useEffect, useRef, Suspense } from "react";
import { FaSearch, FaArrowUp } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import MovingServicesSection from "../components/MovingServicesCard.jsx";

const CitySection = React.lazy(() => import("../components/home/CitySection"));
const Features = React.lazy(() => import("../components/home/Features"));
const FeaturedProperties = React.lazy(() =>
  import("../components/home/FeaturedProperties")
);

const LoadingPlaceholder = () => (
  <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-gray-400">Loading...</div>
  </div>
);

const heroImages = [
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414192/greg-rivers-rChFUMwAe7E-unsplash_q61ltj.jpg",
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414191/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_dynzyf.jpg",
  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741414191/frames-for-your-heart-mR1CIDduGLc-unsplash_hffrlb.jpg",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  const parallaxRef = useRef(null);

  const [featuredRef, featuredInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [cityRef, cityInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setIsLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % heroImages.length
        );
        setIsLoaded(true);
      }, 200);
    },
    onSwipedRight: () => {
      setIsLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
        );
        setIsLoaded(true);
      }, 200);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/listings/listings-home?type=${propertyType}&listingType=${listingType}&status=active&limit=5`
        );
        if (!response.ok) {
          console.error(
            `Fetch failed with status: ${response.status}`,
            await response.text()
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        if (data && Array.isArray(data.listings)) {
          const mappedProperties = data.listings.map((listing) => ({
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
              name: listing.userRef?.fullname || "Agent Name",
              photo:
                listing.userRef?.avatar ||
                "https://randomuser.me/api/portraits/men/1.jpg",
              phone: listing.userRef?.phone || "N/A",
              email: listing.userRef?.email || "N/A",
            },
          }));
          setProperties(mappedProperties);
          console.log("Mapped properties:", mappedProperties);
        } else {
          console.error("Error: Listings data is not an array", data);
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error.message);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [listingType, propertyType]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      if (parallaxRef.current) {
        const scrollPosition = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${
          scrollPosition * 0.4
        }px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % heroImages.length
        );
        setIsLoaded(true);
      }, 200);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSearch = () => {
    if (formData.name.trim()) {
      navigate(`/listings?location=${encodeURIComponent(formData.name)}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % heroImages.length;
    const img = new Image();
    img.src = heroImages[nextIndex];
  }, [currentImageIndex]);

  return (
    <div className="bg-white">
      <section
        className="relative -mt-14 h-screen w-full overflow-hidden"
        {...swipeHandlers}
      >
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div ref={parallaxRef} className="h-full w-full">
                <img
                  src={heroImages[currentImageIndex]}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Hero"
                  loading="eager"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Find Your Dream Home, Effortlessly.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative w-full max-w-3xl mt-6 bg-gray-300 rounded-lg"
          >
            <div className="bg-white shadow-md rounded-lg overflow-hidden flex m-4">
              <input
                type="text"
                id="name"
                placeholder="Enter City, Address..."
                className="w-full p-4 outline-none"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button
                onClick={handleSearch}
                className="bg-teal-500 p-4 m-2 rounded-lg text-white hover:bg-teal-600 transition-colors duration-300 flex items-center justify-center"
              >
                <FaSearch />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 text-white text-sm md:hidden opacity-70">
          <p>Swipe left or right to see more</p>
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

      <motion.section
        ref={featuredRef}
        initial="hidden"
        animate={featuredInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-12"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingPlaceholder />}>
            <FeaturedProperties properties={properties} />
          </Suspense>
        </div>
      </motion.section>

      <motion.section
        ref={cityRef}
        initial="hidden"
        animate={cityInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          <CitySection />
        </Suspense>
      </motion.section>

      <MovingServicesSection />

      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          <Features />
        </Suspense>
      </motion.section>

      <motion.button
        onClick={scrollToTop}
        animate={{
          opacity: showScrollTop ? 1 : 0.4,
          scale: showScrollTop ? 1 : 0.8,
          y: showScrollTop ? [0, -8, 0] : 0,
        }}
        transition={{
          y: showScrollTop
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0 },
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
        }}
        className="fixed right-6 bottom-6 cursor-pointer bg-teal-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </motion.button>
    </div>
  );
};

export default Home;
