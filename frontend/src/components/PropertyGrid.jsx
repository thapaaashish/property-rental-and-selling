import { Link } from "react-router-dom";

const PropertyGrid = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/property/${property.id}`} // Use the correct URL path
          className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 no-underline text-gray-900"
        >
          <img
            src={property.images[0]} // Use the first image as the thumbnail
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-bold">{property.title}</h2>
            <p className="text-gray-600">{property.description}</p>
            <p className="text-lg font-semibold">
              ${property.price} {property.priceUnit}
            </p>
            <p className="text-sm text-gray-500">
              {property.bedrooms} Beds | {property.bathrooms} Baths |{" "}
              {property.area} sqft
            </p>
            <p className="text-sm text-gray-500">
              {property.address.street}, {property.address.city}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PropertyGrid;