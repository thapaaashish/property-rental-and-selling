import React from 'react';

export default function PropertySection({ properties }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Homes For You
          </h2>
          <p className="text-gray-600">Find a perfect place for yourself</p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-full">
            All Properties
          </button>
          <button className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
            For Sale
          </button>
          <button className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
            For Rent
          </button>
        </div>

        <div className="cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="cursor-pointer px-6 py-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            See all listings
          </button>
        </div>
      </div>
    </section>
  );
}


export function PropertyGrid({ properties }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

export function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <img
        src={property.imageUrl}
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>
        <p className="mt-1 text-gray-500">{property.description}</p>
        <div className="mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ${property.price.toLocaleString()}
          </span>
          <p className="text-sm text-gray-600">{property.location}</p>
        </div>
        <div className="mt-4 flex justify-between text-gray-600">
          <div className="flex items-center">
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <span>{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center">
            <span>{property.sqft} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
