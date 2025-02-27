import React, { useState } from 'react';
import { FaSearch, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import CitySection from '../components/CitySection';
import Features from '../components/Features';
import Footer from '../components/Footer';
import PropertySection from '../components/PropertySection';

const Home = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
  });

  const properties = [
    {
      id: 1,
      imageUrl: 'https://crm.roongtadevelopers.com/app/admin/assets/images/blog/1723200045.jpg',
      title: 'Luxury Apartment',
      description: 'A beautiful 2-bedroom apartment.',
      price: 1500000,
      location: 'Kathmandu',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
    },
    {
      id: 2,
      imageUrl: 'https://cdn.architecturendesign.net/wp-content/uploads/2014/07/2-white-modern-studio-design.jpeg',
      title: 'Modern Studio',
      description: 'Compact studio in the city center.',
      price: 800000,
      location: 'Kathmandu',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 500,
    },
    {
      id: 3,
      imageUrl: 'https://cdn.architecturendesign.net/wp-content/uploads/2014/07/2-white-modern-studio-design.jpeg',
      title: 'Modern Studio',
      description: 'Compact studio in the city center.',
      price: 800000,
      location: 'Kathmandu',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 500,
    },
    // Add more properties here
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="bg-gray-100 scroll-smooth md:scroll-auto">
      <section className="bg-fixed relative h-[600px] flex flex-col justify-center items-center text-center bg-gray-300 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-no-repeat">
        {/* Overlay for darkening the background */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <button className="relative z-10 bg-teal-500 text-white px-4 py-2 rounded-2xl mb-4">Stay happy</button>
        <h2 className="relative z-10 text-4xl md:text-5xl font-bold text-white">Find Your Dream Home, Effortlessly.</h2>
        <div className="relative z-10 flex space-x-4 mt-4">
          <button className="border-b-2 border-white text-white cursor-pointer">Sale</button>
          <button className="text-white cursor-pointer">Rent</button>
        </div>
        
        {/* Improved Responsive Search Bar - 70% width on small screens */}
        <div className="relative z-10 w-4/5 sm:w-[70%] md:w-4/5 lg:w-3/4 mx-auto mt-8">
          <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden transition-all">
            {/* Mobile View: Stacked Layout */}
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Search Input */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Enter Name, Keywords..."
                  className="w-full p-4 pl-12 outline-none"
                  value={formData.name}
                  onChange={handleChange}
                  id="name"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <select
                  id="type"
                  className="w-full p-4 appearance-none outline-none bg-transparent"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="relative flex-grow border-b md:border-b-0 md:border-r">
                <select
                  id="location"
                  className="w-full p-4 appearance-none outline-none bg-transparent"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">Location</option>
                  <option value="kathmandu">Kathmandu</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <button className="bg-teal-500 hover:bg-teal-600 text-white font-medium p-4 md:px-8 transition-colors w-full md:w-auto flex items-center justify-center">
                <span className="mr-2">Search</span>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      </section>

      <PropertySection properties={properties} />
      <CitySection />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;