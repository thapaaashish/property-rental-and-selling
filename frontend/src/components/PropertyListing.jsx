import React from 'react';

const PropertyListing = () => {
  const property = {
    name: "Name",
    images: Array(6).fill(''),
    location: "Naxal, Kathmandu, Nepal",
    beds: 2,
    baths: 1,
    host: "Aashish Thapa",
    description: "sdgs",
    price: "Rs 100000",
    amenities: ["Wifi", "Balcony", "Wifi", "Balcony"],
    reviews: [
      { name: "Name", date: "Date", rating: 5, comment: "Comment" },
      { name: "Name", date: "Date", rating: 4, comment: "Comment" },
      { name: "Name", date: "Date", rating: 3, comment: "Comment" },
      { name: "Name", date: "Date", rating: 2, comment: "Comment" },
    ],
  };

  return (
    <div className="min-h-screen bg-white p-6 mt-15">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{property.name}</h1>
        <button className="text-gray-500 hover:text-gray-700">Save</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {property.images.map((_, index) => (
          <div key={index} className="w-full h-32 bg-gray-400 rounded" />
        ))}
      </div>

      <p className="text-lg font-semibold">{property.location}</p>
      <p className="text-gray-600">{`${property.beds} rooms ${property.baths} bath`}</p>
      <p className="text-gray-700">Hosted by {property.host}</p>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-gray-700">{property.description}</p>
      </div>

      <div className="mt-4 border p-4 rounded-lg">
        <h2 className="text-lg font-semibold">How long you want to stay?</h2>
        <div className="flex space-x-4">
          <input type="date" className="w-full p-2 border rounded" />
          <input type="date" className="w-full p-2 border rounded" />
        </div>
        <p className="text-gray-700 mt-2">{property.price}</p>
        <button className="bg-gray-400 text-white px-4 py-2 rounded mt-2">Reserve</button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">What this place offers?</h2>
        <div className="grid grid-cols-2 gap-4">
          {property.amenities.map((amenity, index) => (
            <div key={index} className="p-2 bg-gray-200 rounded">
              <p className="text-gray-700">{amenity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="grid grid-cols-2 gap-4">
          {property.reviews.map((review, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <p className="text-gray-700">{review.name}</p>
              <p className="text-sm text-gray-500">{review.date}</p>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded mt-4">See all</button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="w-full h-64 bg-gray-400 rounded"></div>
      </div>
    </div>
  );
};

export default PropertyListing;
