// pages/Listings.js
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";
import SearchFilters from "../components/SearchFilters";

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
          `http://localhost:3000/api/listings/listings?type=${propertyType}&listingType=${listingType}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Log fetched data for debugging

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
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">{getFilterLabel()}</h1>
            <p className="text-gray-600">
              Find your perfect property from our carefully curated listings
            </p>
          </div>

          {/* Main content area with search, properties, and map placeholder */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: Search and Properties */}
            <div className="flex-2">
              <div className="mb-8">
                <SearchFilters onFilter={handleFilterSubmit} />
              </div>

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

            {/* Right side: Fixed-size Map Placeholder */}
            <div className="w-full lg:w-1/3 bg-gray-100 rounded-lg p-6 flex items-center justify-center h-[550px] flex-shrink-0 overflow-hidden lg:overflow-auto lg:sticky lg:top-40">
              <p className="text-gray-500 text-center">Map will go here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Listings;
