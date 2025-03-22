import { Link } from "react-router-dom";

// Utility function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const PropertyGrid = ({ properties, columns = 3 }) => {
  // Define the grid classes based on the `columns` prop
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  // Handle empty or invalid properties
  if (!properties || !Array.isArray(properties)) {
    return (
      <div className="text-center text-red-600 py-8">
        Invalid properties data.
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">No properties found.</div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-8`}>
      {properties.map((property) => {
        // Use `property.id` if it exists, otherwise fall back to `property._id`
        const propertyId = property.id || property._id;

        return (
          <Link
            key={propertyId}
            to={`/property/${propertyId}`}
            className="border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 duration-300 no-underline text-gray-900 block bg-white w-full"
          >
            {/* Property Thumbnail */}
            <div className="relative">
              <img
                src={
                  property.images?.[0] ||
                  "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741806041/No-Image-Found-400x264_qsl6vk.png"
                }
                alt={property.title}
                className="w-full h-[150px] object-cover"
              />
              {/* Rent/Sale Badge */}
              <div className="absolute top-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                {property.listingType === "rent" ? "For Rent" : "For Sale"}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 truncate mb-2">
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
                <span className="mr-2">
                  <strong>{property.bedrooms}</strong> Bedrooms
                </span>
                <span className="mx-2">|</span>
                <span className="mr-2">
                  <strong>{property.bathrooms}</strong> Bathrooms
                </span>
                <span className="mx-2">|</span>
                <span className="mr-2">
                  <strong>{property.area}</strong> sqft
                </span>
              </div>

              <div className="mt-3 text-emerald-600 font-bold text-2xl">
                Rs. {property.price.toLocaleString()}{" "}
                {property.priceUnit && (
                  <span className="text-sm text-gray-500">
                    /{property.priceUnit}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PropertyGrid;
