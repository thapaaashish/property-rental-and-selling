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
      <section className="bg-fixed relative h-[600px] flex flex-col justify-center items-center text-center mt-16 bg-gray-300 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-no-repeat">
        {/* Overlay for darkening the background */}
        <div className=" absolute inset-0 bg-black opacity-40"></div>

        <button className="relative z-10 bg-gray-500 text-white px-4 py-2 rounded-full mb-4">Live happy</button>
        <h2 className="relative z-10 text-5xl font-bold text-white">Find your perfect place</h2>
        <div className="relative z-10 flex space-x-4 mt-4">
          <button className="border-b-2 border-white text-white cursor-pointer">Sale</button>
          <button className="text-white cursor-pointer">Rent</button>
        </div>
        
        {/* Search Bar with Dropdowns */}
        <div className="p-1.5 sm:w-100 md:w-200 lg:w-180 relative z-10 mt-6 flex items-center justify-between space-x-4 bg-white rounded-full shadow-md overflow-hidden">
          <input
            type="text"
            placeholder="Enter Name, Keywords..."
            className="p-3 flex-grow outline-none"
            value={formData.name}
            onChange={handleChange}
            id="name"
          />

          {/* Type Dropdown */}
          <select
            id="type"
            className="p-3 rounded-md border focus:outline-sky-500"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
          </select>

          {/* Location Dropdown */}
          <select
            id="location"
            className="p-3 rounded-md border focus:outline-sky-500"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            <option value="kathmandu">Kathmandu</option>
            <option value="lalitpur">Lalitpur</option>
            <option value="bhaktapur">Bhaktapur</option>
          </select>

          <button className="bg-sky-300 hover:bg-sky-700 cursor-pointer p-4 rounded-full m-1">
            <FaSearch />
          </button>
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
