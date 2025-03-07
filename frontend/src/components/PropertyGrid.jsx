import { Link } from "react-router-dom";

const PropertyGrid = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/property/${property.id}`}
          className="border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 duration-300 no-underline text-gray-900 block bg-white w-full"
        >
          {/* Property Thumbnail */}
          <div className="relative">
            <img
              src={property.images?.[0] || "https://via.placeholder.com/500"}
              alt={property.title}
              className="w-full h-[150px] object-cover" // Reduced height
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
            <p className="text-sm text-gray-600 mb-2">
              {property.address.street}, {property.address.city}
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
  );
};

export default PropertyGrid;
