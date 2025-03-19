import { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const FeaturedProperties = ({ properties }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoScrollInterval = useRef(null);

  const navigateProperties = useCallback(
    (direction) => {
      if (properties.length === 0 || isTransitioning) return;

      setIsTransitioning(true);

      const newIndex =
        direction === "left"
          ? (currentIndex - 1 + properties.length) % properties.length
          : (currentIndex + 1) % properties.length;

      setCurrentIndex(newIndex);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with CSS transition duration
    },
    [currentIndex, properties.length, isTransitioning]
  );

  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      navigateProperties("right");
    }, 6000); // Change slides every 6 seconds

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [navigateProperties]);

  const getVisibleProperties = useCallback(() => {
    if (!properties || properties.length === 0) return [];

    const result = [];
    const displayCount = Math.min(3, properties.length);

    for (let i = 0; i < displayCount; i++) {
      const offset = i - Math.floor(displayCount / 2);
      let index =
        (currentIndex + offset + properties.length) % properties.length;
      result.push({ ...properties[index], originalIndex: index });
    }

    return result;
  }, [currentIndex, properties]);

  const visibleProperties = getVisibleProperties();

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6 relative">
        <div className="relative flex justify-center items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Properties
          </h2>
          <Link
            to="/listings"
            className="absolute right-0 text-teal-500 flex items-center hover:underline"
          >
            View all properties <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none"></div>

          <button
            onClick={() => navigateProperties("left")}
            className="absolute cursor-pointer left-6 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-20 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 transition-all"
            aria-label="Previous property"
            disabled={isTransitioning}
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex justify-center items-center gap-8 py-4 overflow-hidden min-h-[400px]">
            <div className="w-full flex justify-center gap-8">
              {visibleProperties.map((property, index) => (
                <Link
                  key={`${property.id}-${index}`}
                  to={`/property/${property.id}`}
                  className={`
                    group border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
                    transition-all duration-500 ease-in-out no-underline text-gray-900 bg-white 
                    w-[350px] flex-shrink-0 property-card
                    ${index === 0 ? "left" : index === 2 ? "right" : "center"}
                  `}
                >
                  <div className="relative">
                    <img
                      src={property.images?.[0]}
                      alt={property.title}
                      className="w-full h-[200px] object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                      {property.listingType === "rent"
                        ? "For Rent"
                        : "For Sale"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 truncate mb-2">
                      {property.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {property.address.street}, {property.address.city}
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

                    <div className="mt-3 text-emerald-600 font-bold text-2xl">
                      ${property.price}{" "}
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

          <button
            onClick={() => navigateProperties("right")}
            className="absolute cursor-pointer right-6 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-20 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 transition-all"
            aria-label="Next property"
            disabled={isTransitioning}
          >
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex justify-center mt-6 gap-2">
            {properties.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setCurrentIndex(index);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "w-8 bg-teal-500" : "w-2 bg-gray-300"
                }`}
                aria-label={`Go to property ${index + 1}`}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
