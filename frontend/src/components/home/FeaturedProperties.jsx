import { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedProperties = ({ properties = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoScrollInterval = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine how many properties to show based on screen size
  const getVisibleCount = () => (windowWidth >= 1024 ? 3 : 1);

  // Handle navigation with infinite loop
  const navigateProperties = useCallback(
    (direction) => {
      if (properties.length === 0 || isTransitioning) return;

      setIsTransitioning(true);
      const visibleCount = getVisibleCount();

      setCurrentIndex((prev) => {
        if (direction === "left") {
          return (prev - 1 + properties.length) % properties.length;
        } else {
          return (prev + 1) % properties.length;
        }
      });

      setTimeout(() => setIsTransitioning(false), 500);
    },
    [properties.length, isTransitioning, windowWidth]
  );

  // Auto-scroll functionality
  useEffect(() => {
    autoScrollInterval.current = setInterval(
      () => navigateProperties("right"),
      6000
    );
    return () => clearInterval(autoScrollInterval.current);
  }, [navigateProperties]);

  // Get currently visible properties with infinite loop support
  const getVisibleProperties = () => {
    const visibleCount = getVisibleCount();
    const result = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % properties.length;
      result.push(properties[index]);
    }

    return result;
  };

  // Calculate which property is considered "middle" for dot highlighting
  const getMiddleIndex = () => {
    const visibleCount = getVisibleCount();
    if (visibleCount === 1) return currentIndex;
    return (currentIndex + Math.floor(visibleCount / 2)) % properties.length;
  };

  if (properties.length === 0) {
    return (
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 text-center text-gray-600">
          No featured properties available.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6 relative">
        <div className="relative flex justify-center items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Properties
          </h2>
          <Link
            to="/listings"
            className="absolute right-0 text-teal-500 flex items-center hover:text-teal-600 transition-colors duration-200"
          >
            View all properties <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="relative overflow-hidden">
          {/* Navigation Arrows */}
          <button
            onClick={() => navigateProperties("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-20 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
            disabled={isTransitioning}
          >
            <ArrowLeft className="h-6 w-6 text-teal-500" />
          </button>
          <button
            onClick={() => navigateProperties("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-20 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
            disabled={isTransitioning}
          >
            <ArrowRight className="h-6 w-6 text-teal-500" />
          </button>

          {/* Property Cards */}
          <div className="flex justify-center">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className={`grid gap-6 w-full ${
                getVisibleCount() === 3
                  ? "grid-cols-1 md:grid-cols-3 max-w-6xl"
                  : "grid-cols-1 max-w-md"
              }`}
            >
              {getVisibleProperties().map((property, idx) => (
                <Link
                  key={`${property.id}-${idx}`}
                  to={`/property/${property.id}`}
                  className={`block bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 no-underline text-neutral-800 ${
                    idx === Math.floor(getVisibleCount() / 2)
                      ? "border-2 border-teal-500"
                      : "border border-gray-200"
                  } hover:border-teal-600`}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {property.address.street}, {property.address.city}
                    </p>
                    <p className="text-lg font-bold text-teal-500 mt-2">
                      Rs.{property.price.toLocaleString()}
                      {property.priceUnit && (
                        <span className="text-sm text-gray-500">
                          /{property.priceUnit}
                        </span>
                      )}
                    </p>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{property.bedrooms} Beds</span>
                      <span>{property.bathrooms} Baths</span>
                      <span>{property.area} sqft</span>
                    </div>
                    <span className="mt-4 inline-block text-teal-500 hover:text-teal-600 font-medium">
                      View Details
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isTransitioning) {
                  const visibleCount = getVisibleCount();
                  const middleOffset = Math.floor(visibleCount / 2);
                  let targetIndex =
                    (idx - middleOffset + properties.length) %
                    properties.length;
                  setCurrentIndex(targetIndex);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === getMiddleIndex()
                  ? "w-8 bg-teal-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to property ${idx + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
