import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";
import SearchFilters from "../components/SearchFilters";
import { MapWithAllProperties } from "../components/GoogleMap";

const API_BASE = import.meta.env.VITE_API_URL;

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages from backend
  const [totalListings, setTotalListings] = useState(0); // Total listings from backend
  const [showMap, setShowMap] = useState(false); // Mobile map visibility
  const limit = 12; // Match backend's limit or override default 9

  const handleFilterSubmit = useCallback(
    (filters) => {
      const params = new URLSearchParams();
      params.set(
        "listingType",
        filters.type === "sale"
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
        const query = new URLSearchParams(searchParams);
        const startIndex = (page - 1) * limit; // Calculate startIndex from page
        query.set("startIndex", startIndex);
        query.set("limit", limit); // Override default 9
        const queryString = query.toString();
        const response = await fetch(
          `${API_BASE}/api/listings/listings?${queryString}`
        );
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
            id: listing.userRef._id, // Use populated userRef data
            name: listing.userRef.fullname,
            photo: listing.userRef.avatar,
            phone: listing.userRef.phone,
            email: listing.userRef.email,
          },
          location: listing.location,
        }));
        console.log("Mapped properties:", mappedProperties);
        setProperties(mappedProperties);
        setTotalListings(data.totalListings || 0); // Set total listings
        setTotalPages(data.totalPages || 1); // Use backend's totalPages
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchParams, page]); // `page` triggers refetch

  const markers = properties
    .filter((property) => property.location?.coordinates)
    .map((property) => ({
      lat: property.location.coordinates[1],
      lng: property.location.coordinates[0],
      title: property.title,
      listingId: property.id,
    }));

  const mapWithMarkersCount = markers.length;

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
                <>
                  <PropertyGrid properties={properties} />
                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1 || loading}
                      className="px-4 py-2 bg-gray-900 cursor-pointer text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 font-medium">
                      Page {page} of {totalPages} ({properties.length} of{" "}
                      {totalListings} listings)
                    </span>
                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages || loading}
                      className="px-4 py-2 cursor-pointer bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                </>
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

              {/* Mobile Map Section */}
              <div className="mt-8 lg:hidden">
                <div className="h-[50vh] sm:h-[60vh]">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Property Locations
                        </h3>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                          {mapWithMarkersCount}{" "}
                          {mapWithMarkersCount === 1
                            ? "property"
                            : "properties"}
                        </span>
                      </div>
                    </div>
                    <div className="h-[calc(100%-60px)]">
                      <MapWithAllProperties markers={markers} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Map with Property Count Header */}
            <div className="hidden lg:block sticky top-24 h-[80vh]">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Map View
                    </h3>
                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                      {mapWithMarkersCount}{" "}
                      {mapWithMarkersCount === 1 ? "property" : "properties"}
                    </span>
                  </div>
                </div>
                <div className="h-[calc(100%-73px)]">
                  <MapWithAllProperties markers={markers} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Listings;
