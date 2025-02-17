import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Welcome to our platform! We specialize in helping you find your perfect home. Our mission is to provide a seamless and easy-to-use service for property seekers and property owners alike.
        </p>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Our Vision</h2>
          <p className="text-lg text-gray-600">
            We aim to revolutionize the real estate industry by offering a user-friendly platform, a wide range of property listings, and expert guidance every step of the way.
          </p>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Our Team</h2>
          <p className="text-lg text-gray-600">
            Our team is made up of passionate individuals who are dedicated to helping you find your ideal property. With years of experience in the real estate sector, we're here to make your property search easy and efficient.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
