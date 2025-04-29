import React, { useState, useEffect } from "react";

const cityImages = {
  Kathmandu:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Boudhanath_Panorama_2016.jpg/1920px-Boudhanath_Panorama_2016.jpg",
  Pokhara:
    "https://upload.wikimedia.org/wikipedia/commons/6/66/Pokhara_and_Phewa_Lake.jpg",
};

const API_BASE = import.meta.env.VITE_API_URL;

export default function CitySection() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch city counts from backend
  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/listings/city-counts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Map data with static images
        const citiesWithImages = data.map((city) => ({
          ...city,
          image: cityImages[city.name] || "https://via.placeholder.com/400",
        }));
        setCities(citiesWithImages);
      } catch (err) {
        setError("Failed to load city data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCityCounts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 bg-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white text-red-500">
        Error: {error}
      </div>
    );
  }

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
              key={city.name}
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
