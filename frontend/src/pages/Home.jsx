import React from 'react';
import { FaSearch, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="bg-gray-100">
      <section className="h-[600px] flex flex-col justify-center items-center text-center bg-gray-300 bg-[url('/images/bgww.jpg')] bg-cover bg-center bg-no-repeat">
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

      {/* Featured Listings */}
      <section className="py-10">
        <h3 className="text-center text-2xl font-semibold">Homes For You</h3>
        <div className="flex justify-center space-x-4 mt-6">
          <div className="bg-white p-4 shadow-lg w-64">
            <h4 className="text-lg font-bold">Apartment</h4>
            <p>Rs 100000</p>
            <p>Kathmandu</p>
          </div>
          <div className="bg-white p-4 shadow-lg w-64">
            <h4 className="text-lg font-bold">Room 11</h4>
            <p>Rs 10000/month</p>
            <p>Kathmandu</p>
          </div>
          <div className="bg-white p-4 shadow-lg w-64">
            <h4 className="text-lg font-bold">House</h4>
            <p>Rs 5000000</p>
            <p>Kathmandu</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
