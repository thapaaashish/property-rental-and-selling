import { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Utility function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
};

const FeaturedProperties = ({ properties = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoScrollInterval = useRef(null);

  // Handle property navigation
  const navigateProperties = useCallback(
    (direction) => {
      if (properties.length === 0 || isTransitioning) return;

      setIsTransitioning(true);

      const newIndex =
        direction === "left"
          ? (currentIndex - 1 + properties.length) % properties.length
          : (currentIndex + 1) % properties.length;

      setCurrentIndex(newIndex);

      setTimeout(() => setIsTransitioning(false), 500); // Matches CSS transition duration
    },
    [currentIndex, properties.length, isTransitioning]
  );

  // Auto-scroll functionality
  useEffect(() => {
    autoScrollInterval.current = setInterval(
      () => navigateProperties("right"),
      6000
    ); // Auto-scroll every 6 seconds
    return () => clearInterval(autoScrollInterval.current);
  }, [navigateProperties]);

  // Get visible properties for the carousel
  const getVisibleProperties = useCallback(() => {
    if (properties.length === 0) return [];

    const displayCount = Math.min(3, properties.length);
    const result = [];

    for (let i = 0; i < displayCount; i++) {
      const offset = i - Math.floor(displayCount / 2);
      const index =
        (currentIndex + offset + properties.length) % properties.length;
      result.push({ ...properties[index], originalIndex: index });
    }

    return result;
  }, [currentIndex, properties]);

  const visibleProperties = getVisibleProperties();

  // Handle no properties case
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
        {/* Section Header */}
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

        {/* Carousel Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />

          {/* Navigation Arrows */}
          <button
            onClick={() => navigateProperties("left")}
            className="absolute cursor-pointer left-4 md:left-6 top-1/2 -translate-y-1/2 bg-teal-500 rounded-full p-2 shadow-md z-20 hover:bg-teal-300 focus:ring-2 focus:ring-gray-900 transition-all duration-200 disabled:opacity-50"
            aria-label="Previous property"
            disabled={isTransitioning}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>

          {/* Property Cards */}
          <div className="flex justify-center items-center gap-6 md:gap-8 py-4 overflow-hidden min-h-[400px]">
            <div className="w-full flex justify-center gap-6 md:gap-8">
              {visibleProperties.map((property, index) => (
                <Link
                  key={`${property.id}-${index}`}
                  to={`/property/${property.id}`}
                  className={`
                    group border rounded-2xl overflow-hidden shadow-md hover:shadow-xl 
                    transition-all duration-500 ease-in-out no-underline text-gray-900 bg-white 
                    w-[300px] md:w-[350px] flex-shrink-0 property-card
                    ${index === 0 ? "left" : index === 2 ? "right" : "center"}
                  `}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        property.images?.[0] ||
                        "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741806041/No-Image-Found-400x264_qsl6vk.png"
                      }
                      alt={property.title}
                      className="w-full h-[180px] md:h-[200px] object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {property.listingType === "rent"
                        ? "For Rent"
                        : "For Sale"}
                    </div>
                  </div>

                  <div className="p-5 bg-white">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate mb-2">
                      {property.title}
                    </h2>
                    <p className="text-sm mb-2">
                      <span className="text-gray-800 font-medium">
                        {capitalizeFirstLetter(property.type)}
                      </span>
                      <span className="text-gray-600">
                        {" - "}
                        {property.address.street}, {property.address.city}
                      </span>
                    </p>

                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <span>
                        <strong>{property.bedrooms}</strong> Beds
                      </span>
                      <span className="mx-2">|</span>
                      <span>
                        <strong>{property.bathrooms}</strong> Baths
                      </span>
                      <span className="mx-2">|</span>
                      <span>
                        <strong>{property.area}</strong> sqft
                      </span>
                    </div>

                    <div className="mt-3 text-emerald-600 font-bold text-xl md:text-2xl">
                      Rs. {property.price.toLocaleString()}{" "}
                      {property.priceUnit && (
                        <span className="text-sm text-gray-500">
                          /{property.priceUnit}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => navigateProperties("right")}
            className="absolute cursor-pointer right-4 md:right-6 top-1/2 -translate-y-1/2 bg-teal-500 rounded-full p-2 shadow-md z-20 hover:bg-teal-300 focus:ring-2 focus:ring-dark-900 transition-all duration-200 disabled:opacity-50"
            aria-label="Next property"
            disabled={isTransitioning}
          >
            <ArrowRight className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => !isTransitioning && setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-8 bg-teal-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to property ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
