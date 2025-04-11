import { Link } from "react-router-dom";
import {
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Home,
  CalendarDays,
} from "lucide-react";

const PropertyGrid = ({ properties, columns = 3 }) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
  };

  if (!properties || !Array.isArray(properties)) {
    return (
      <div className="text-center text-neutral-500 py-12">
        Invalid properties data.
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-12">
        No properties found.
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {properties.map((property) => {
        const propertyId = property.id || property._id;

        return (
          <Link
            key={propertyId}
            to={`/property/${propertyId}`}
            className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors duration-200 no-underline text-neutral-800 block bg-white w-full"
          >
            {/* Property Thumbnail */}
            <div className="relative">
              <img
                src={
                  property.images?.[0] ||
                  "https://via.placeholder.com/600x400?text=No+Image"
                }
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-white text-neutral-800 px-3 py-1 rounded-md text-xs font-medium border border-neutral-200 flex items-center">
                {property.listingType === "rent" ? (
                  <>
                    <CalendarDays className="w-3 h-3 mr-1" />
                    For Rent
                  </>
                ) : (
                  "For Sale"
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h2 className="text-lg font-medium text-neutral-900 mb-1">
                {property.title}
              </h2>

              <div className="flex items-center text-neutral-500 text-sm mb-3">
                <MapPin className="w-3 h-3 mr-1" />
                <span>
                  {property.address.street}, {property.address.city}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-neutral-600 text-sm mb-4">
                <div className="flex items-center">
                  <Home className="w-3 h-3 mr-1 text-neutral-400" />
                  <span className="capitalize">{property.type}</span>
                </div>
                <div className="flex items-center">
                  <BedDouble className="w-3 h-3 mr-1 text-neutral-400" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-3 h-3 mr-1 text-neutral-400" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="w-3 h-3 mr-1 text-neutral-400" />
                  <span>{property.area} sqft</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <div className="text-neutral-900 font-medium text-lg">
                  Rs. {property.price.toLocaleString()}
                  {property.priceUnit && (
                    <span className="text-neutral-500 text-sm font-normal ml-1">
                      /{property.priceUnit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PropertyGrid;
