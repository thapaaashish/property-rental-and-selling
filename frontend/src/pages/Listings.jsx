import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";
import SearchFilters from "../components/SearchFilters";
import { MapWithAllProperties } from "../components/GoogleMap";

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFilterSubmit = useCallback(
    (filters) => {
      const params = new URLSearchParams();
      params.set(
        "listingType",
        filters.type === "buy"
          ? "Sale"
          : filters.type === "rent"
          ? "Rent"
          : "all"
      );
      if (filters.propertyType) params.set("type", filters.propertyType);
      if (filters.location) params.set("location", filters.location);
      if (filters.priceMin) params.set("priceMin", filters.priceMin);
      if (filters.priceMax) params.set("priceMax", filters.priceMax);
      if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
      if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
      console.log("URL Params set to:", params.toString());
      setSearchParams(params);
    },
    [setSearchParams]
  );

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        console.log("Fetching with query:", `/api/listings/listings?${query}`);
        const response = await fetch(`/api/listings/listings?${query}`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Raw API response:", data);
        const listings = data.listings || [];
        const mappedProperties = listings.map((listing) => ({
          id: listing._id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceUnit: listing.rentOrSale === "Rent" ? "monthly" : "total",
          address: listing.address,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          images: listing.imageUrls,
          type: listing.listingType.toLowerCase(),
          listingType: listing.rentOrSale.toLowerCase(),
          features: [],
          amenities: listing.amenities || [],
          isFeatured: false,
          isNew:
            new Date(listing.createdAt).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          agent: {
            id: listing.userRef,
            name: "Agent Name",
            photo: "https://randomuser.me/api/portraits/men/1.jpg",
            phone: "555-123-4567",
            email: "agent@example.com",
          },
          location: listing.location,
        }));
        console.log("Mapped properties:", mappedProperties);
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchParams]);

  const markers = properties
    .filter((property) => property.location?.coordinates)
    .map((property) => ({
      lat: property.location.coordinates[1],
      lng: property.location.coordinates[0],
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-5 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <div className="flex flex-col">
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
            <div className="hidden lg:block sticky top-24 h-[80vh]">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
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
