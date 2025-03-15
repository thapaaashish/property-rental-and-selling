import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";
import SearchFilters from "../components/SearchFilters";
import { MapWithAllProperties } from "../components/GoogleMap";

const Listings = () => {
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get("listing") || "all";
  const propertyType = searchParams.get("type") || "all";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle filter submissions
  const handleFilterSubmit = (filters) => {
    console.log("Filters submitted:", filters);
  };

  // Fetch properties from the backend
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `api/listings/listings?type=${propertyType}&listingType=${listingType}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Map the fetched data to match the expected frontend format
        const mappedProperties = data.map((listing) => ({
          id: listing._id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceUnit: listing.rentOrSale === "Rent" ? "monthly" : "total",
          address: listing.address, // Use the address object directly from the backend
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          images: listing.imageUrls,
          type: listing.listingType.toLowerCase(),
          listingType: listing.rentOrSale.toLowerCase(),
          features: [], // Add features if available
          amenities: listing.amenities || [], // Use amenities from the backend
          isFeatured: false, // Add isFeatured if available
          isNew:
            new Date(listing.createdAt).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000, // New listings are less than 30 days old
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          agent: {
            id: listing.userRef,
            name: "Agent Name", // Add agent name if available
            photo: "https://randomuser.me/api/portraits/men/1.jpg", // Add agent photo if available
            phone: "555-123-4567", // Add agent phone if available
            email: "agent@example.com", // Add agent email if available
          },
          location: listing.location,
        }));

        // Set the mapped properties to the state
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [listingType, propertyType]);

  // Extract coordinates for the map markers
  const markers = properties
    .filter((property) => property.location?.coordinates) // Filter properties with valid coordinates
    .map((property) => ({
      lat: property.location.coordinates[1], // Latitude
      lng: property.location.coordinates[0], // Longitude
    }));

  console.log("Markers:", markers); // Debug the markers array

  // Filter label based on URL parameters
  const getFilterLabel = () => {
    let label = "All Properties";

    if (listingType === "buy") {
      label = "Properties for Sale";
    } else if (listingType === "rent") {
      label = "Properties for Rent";
    }

    if (propertyType !== "all") {
      const propertyTypeMap = {
        apartment: "Apartments",
        house: "Houses",
        condo: "Condos",
        villa: "Villas",
        office: "Commercial Properties",
      };

      label = propertyTypeMap[propertyType] || label;

      if (listingType === "buy") {
        label += " for Sale";
      } else if (listingType === "rent") {
        label += " for Rent";
      }
    }

    return label;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-5 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Grid layout to keep the map always on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* Left side: Content */}
            <div className="flex flex-col">
              <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">{getFilterLabel()}</h1>
                <p className="text-gray-600">
                  Find your perfect property from our carefully curated listings
                </p>
              </div>

              {/* Search Filters */}
              <div className="mb-8">
                <SearchFilters onFilter={handleFilterSubmit} />
              </div>

              {/* Properties */}
              {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : properties.length > 0 ? (
                <PropertyGrid properties={properties} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    We couldn't find any properties matching your criteria. Try
                    adjusting your filters or check back later.
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Always visible Map */}
            <div className="hidden lg:block sticky top-24 h-[80vh]">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                {/* Pass markers to GoogleMapComponent */}
                <MapWithAllProperties markers={markers} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Listings;