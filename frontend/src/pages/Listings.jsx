import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyGrid from '../components/PropertyGrid';
import SearchFilters from '../components/SearchFilters';

const Listings = () => {
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listing') || 'all';
  const propertyType = searchParams.get('type') || 'all';
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Handle filter submissions
  const handleFilterSubmit = (filters) => {
    console.log('Filters submitted:', filters);
    // In a real app, you would update the URL or fetch filtered properties
  };
  
  // Fetch properties (simulated)
  useEffect(() => {
    const fetchProperties = () => {
      setLoading(true);
      
      setTimeout(() => {
        const allProperties = [
          {
            id: '1',
            title: 'Modern Apartment with City View',
            description: 'Luxurious apartment with stunning city views and modern amenities.',
            price: 2500,
            priceUnit: 'monthly',
            address: {
              street: '123 Downtown Ave',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA',
            },
            bedrooms: 2,
            bathrooms: 2,
            area: 1200,
            images: [
              'https://images.unsplash.com/photo-1564597195-c999d5b347fd',  // Image from Unsplash
              'https://images.unsplash.com/photo-1564597195-d4984c80162d',  // Image from Unsplash
            ],
            type: 'apartment',
            listingType: 'rent',
            features: ['City View', 'Modern Design', 'High Ceiling'],
            amenities: ['Gym', 'Pool', 'Parking', 'Security'],
            isFeatured: true,
            isNew: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent1',
              name: 'John Doe',
              photo: 'https://randomuser.me/api/portraits/men/1.jpg',  // Random user image
              phone: '555-123-4567',
              email: 'john@example.com',
            },
          },
          {
            id: '2',
            title: 'Spacious Family Home',
            description: 'Beautiful family home with large backyard in quiet neighborhood.',
            price: 750000,
            priceUnit: 'total',
            address: {
              street: '456 Suburban St',
              city: 'Los Angeles',
              state: 'CA',
              zip: '90001',
              country: 'USA',
            },
            bedrooms: 4,
            bathrooms: 3,
            area: 2800,
            images: [
              'https://images.unsplash.com/photo-1594722007400-c04e45bc1a8f',  // Image from Unsplash
              'https://images.unsplash.com/photo-1594735486804-50147b4470c3',  // Image from Unsplash
            ],
            type: 'house',
            listingType: 'sale',
            features: ['Backyard', 'Quiet Neighborhood', 'Family Friendly'],
            amenities: ['Garden', 'Garage', 'Patio', 'Fireplace'],
            isFeatured: true,
            isNew: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent2',
              name: 'Jane Smith',
              photo: 'https://randomuser.me/api/portraits/women/2.jpg',  // Random user image
              phone: '555-987-6543',
              email: 'jane@example.com',
            },
          },
          {
            id: '3',
            title: 'Downtown Condo',
            description: 'Modern condo in the heart of downtown with amazing amenities.',
            price: 1800,
            priceUnit: 'monthly',
            address: {
              street: '789 City Center',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'USA',
            },
            bedrooms: 1,
            bathrooms: 1,
            area: 850,
            images: [
              'https://images.unsplash.com/photo-1574158622685-cf1b92eaf3c0',  // Image from Unsplash
              'https://images.unsplash.com/photo-1581276872177-9b56b4f5b0c5',  // Image from Unsplash
            ],
            type: 'condo',
            listingType: 'rent',
            features: ['Downtown', 'Modern', 'Convenient'],
            amenities: ['Gym', 'Rooftop Deck', 'Doorman', 'Laundry'],
            isFeatured: false,
            isNew: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent3',
              name: 'Robert Johnson',
              photo: 'https://randomuser.me/api/portraits/men/3.jpg',  // Random user image
              phone: '555-456-7890',
              email: 'robert@example.com',
            },
          },
          {
            id: '4',
            title: 'Luxury Villa with Pool',
            description: 'Stunning luxury villa with private pool and ocean views.',
            price: 1200000,
            priceUnit: 'total',
            address: {
              street: '101 Beachfront Dr',
              city: 'Miami',
              state: 'FL',
              zip: '33101',
              country: 'USA',
            },
            bedrooms: 5,
            bathrooms: 4,
            area: 4500,
            images: [
              'https://images.unsplash.com/photo-1531297494163-f019433c3a98',  // Image from Unsplash
              'https://images.unsplash.com/photo-1520880867055-dc6e0e6e1de4',  // Image from Unsplash
            ],
            type: 'villa',
            listingType: 'sale',
            features: ['Ocean View', 'Private Pool', 'Luxury'],
            amenities: ['Pool', 'Beach Access', 'Home Theater', 'Wine Cellar'],
            isFeatured: true,
            isNew: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent4',
              name: 'Sarah Wilson',
              photo: 'https://randomuser.me/api/portraits/women/4.jpg',  // Random user image
              phone: '555-234-5678',
              email: 'sarah@example.com',
            },
          },
          {
            id: '5',
            title: 'Commercial Office Space',
            description: 'Prime location office space perfect for small businesses.',
            price: 3500,
            priceUnit: 'monthly',
            address: {
              street: '555 Business Blvd',
              city: 'San Francisco',
              state: 'CA',
              zip: '94105',
              country: 'USA',
            },
            bedrooms: 0,
            bathrooms: 2,
            area: 1800,
            images: [
              'https://images.unsplash.com/photo-1565575813-38f10d8b5c73',  // Image from Unsplash
              'https://images.unsplash.com/photo-1574181073704-9b56bca38c42',  // Image from Unsplash
            ],
            type: 'office',
            listingType: 'rent',
            features: ['Prime Location', 'Modern Building', 'Corner Unit'],
            amenities: ['Conference Room', 'Reception', 'Kitchen', 'Parking'],
            isFeatured: false,
            isNew: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent5',
              name: 'Michael Brown',
              photo: 'https://randomuser.me/api/portraits/men/5.jpg',  // Random user image
              phone: '555-876-5432',
              email: 'michael@example.com',
            },
          },
          {
            id: '6',
            title: 'Charming Studio Apartment',
            description: 'Cozy studio apartment in trendy neighborhood with great amenities.',
            price: 1200,
            priceUnit: 'monthly',
            address: {
              street: '222 Hipster Lane',
              city: 'Portland',
              state: 'OR',
              zip: '97201',
              country: 'USA',
            },
            bedrooms: 0,
            bathrooms: 1,
            area: 550,
            images: [
              'https://images.unsplash.com/photo-1601748364402-55cf16d15cbe',  // Image from Unsplash
              'https://images.unsplash.com/photo-1600715425032-3eaf8d9a3bb9',  // Image from Unsplash
            ],
            type: 'apartment',
            listingType: 'rent',
            features: ['Trendy Neighborhood', 'Cozy', 'Modern'],
            amenities: ['Bike Storage', 'Rooftop', 'Pet Friendly', 'Laundry'],
            isFeatured: false,
            isNew: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agent: {
              id: 'agent6',
              name: 'Emily Davis',
              photo: 'https://randomuser.me/api/portraits/women/6.jpg',  // Random user image
              phone: '555-345-6789',
              email: 'emily@example.com',
            },
          },
        ];
        
        
        // Filter properties based on URL parameters
        let filteredProperties = allProperties;
        
        if (listingType !== 'all') {
          const mappedListingType = listingType === 'buy' ? 'sale' : listingType;
          filteredProperties = filteredProperties.filter(p => p.listingType === mappedListingType);
        }
        
        if (propertyType !== 'all') {
          filteredProperties = filteredProperties.filter(p => p.type === propertyType);
        }
        
        setProperties(filteredProperties);
        setLoading(false);
      }, 1000);
    };

    fetchProperties();
  }, [listingType, propertyType]);

  // Filter label based on URL parameters
  const getFilterLabel = () => {
    let label = 'All Properties';
    
    if (listingType === 'buy') {
      label = 'Properties for Sale';
    } else if (listingType === 'rent') {
      label = 'Properties for Rent';
    }
    
    if (propertyType !== 'all') {
      const propertyTypeMap = {
        apartment: 'Apartments',
        house: 'Houses',
        condo: 'Condos',
        villa: 'Villas',
        office: 'Commercial Properties'
      };
      
      label = propertyTypeMap[propertyType] || label;
      
      if (listingType === 'buy') {
        label += ' for Sale';
      } else if (listingType === 'rent') {
        label += ' for Rent';
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
            <div className="flex-1">
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
                  <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-gray-600 max-w-md">
                    We couldn't find any properties matching your criteria. Try adjusting your filters or check back later.
                  </p>
                </div>
              )}
            </div>
            
            {/* Right side: Map Placeholder */}
            <div className="w-full lg:w-1/3 bg-gray-100 rounded-lg p-6 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Map will go here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Listings;