import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:3000/backend/listings/listings/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to fetch property details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h3 className="text-xl font-semibold text-red-500">{error}</h3>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h3 className="text-xl font-semibold">Property not found.</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 mt-15">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          {property.title || "Untitled Property"}
        </h1>
        <button className="text-gray-500 hover:text-gray-700">Save</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {(property.imageUrls || []).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Property ${index + 1}`}
            className="w-full h-32 object-cover rounded"
          />
        ))}
      </div>

      <p className="text-lg font-semibold">
        {property.address?.street || "Address not available"}
      </p>
      <p className="text-gray-600">{`${property.bedrooms || 0} rooms ${
        property.bathrooms || 0
      } bath`}</p>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-gray-700">
          {property.description || "No description available"}
        </p>
      </div>

      <div className="mt-4 border p-4 rounded-lg">
        <h2 className="text-lg font-semibold">How long you want to stay?</h2>
        <div className="flex space-x-4">
          <input type="date" className="w-full p-2 border rounded" />
          <input type="date" className="w-full p-2 border rounded" />
        </div>
        <p className="text-gray-700 mt-2">
          ${(property.price || 0).toLocaleString()}
        </p>
        <button className="bg-gray-400 text-white px-4 py-2 rounded mt-2">
          Reserve
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">What this place offers?</h2>
        <div className="grid grid-cols-2 gap-4">
          {(property.amenities || []).map((amenity, index) => (
            <div key={index} className="p-2 bg-gray-200 rounded">
              <p className="text-gray-700">{amenity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="w-full h-64 bg-gray-400 rounded">
          {property.address?.city && property.address?.state
            ? `${property.address.city}, ${property.address.state}`
            : "Location details not available"}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
