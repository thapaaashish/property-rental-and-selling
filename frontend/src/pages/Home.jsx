import React from 'react';
import { FaSearch, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import CitySection from '../components/CitySection';
import Features from '../components/Features';
import Footer from '../components/Footer';
import PropertySection from '../components/PropertySection';

const Home = () => {
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
  return (
    <div className="bg-gray-100">
      <section className="h-[600px] flex flex-col justify-center items-center text-center bg-gray-300 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-no-repeat">
      <button className="bg-gray-500 text-white px-4 py-2 rounded-full mb-4">Live happy</button>
      <h2 className="text-5xl font-bold">Find your perfect place</h2>
      <div className="flex space-x-4 mt-4">
        <button className="border-b-2 border-black">Sale</button>
        <button>Rent</button>
      </div>
      <div className="mt-6 flex items-center bg-white rounded-full shadow-md overflow-hidden w-96">
        <input
          type="text"
          placeholder="Enter Name, Keywords..."
          className="p-3 flex-grow outline-none"
        />
        <button className="bg-pink-700 hover:bg-pink-900 p-3 rounded-full m-1.5">
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
