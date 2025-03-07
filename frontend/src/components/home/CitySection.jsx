import React from 'react';

const cities = [
  {
    id: 1,
    name: 'Kathmandu',
    properties: 235,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Boudhanath_Panorama_2016.jpg/1920px-Boudhanath_Panorama_2016.jpg'
  },
  {
    id: 2,
    name: 'Pokhara',
    properties: 184,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Pokhara_and_Phewa_Lake.jpg'
  }
];

export default function CitySection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find Properties in These Cities
          </h2>
          <p className="text-gray-600">
            Explore properties in the most popular cities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cities.map((city) => (
            <div
              key={city.id}
              className="relative h-80 rounded-lg overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition-opacity" />
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
                <p>{city.properties} Properties</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}