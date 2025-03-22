import React, { useState } from "react";

const MovingServicePopup = ({
  name,
  contact,
  locations,
  description,
  servicesOffered,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold text-blue-600 mb-4">{name}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-gray-700 font-semibold">Contact</h4>
            <p className="text-gray-600">{contact.phone}</p>
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-500 hover:underline"
            >
              {contact.email}
            </a>
          </div>
          <div>
            <h4 className="text-gray-700 font-semibold">Working Locations</h4>
            <ul className="list-disc list-inside text-gray-600">
              {locations.map((location, index) => (
                <li key={index}>{location}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-gray-700 font-semibold">About</h4>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <div>
            <h4 className="text-gray-700 font-semibold">Services Offered</h4>
            <ul className="flex flex-wrap gap-2">
              {servicesOffered.map((service, index) => (
                <li
                  key={index}
                  className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={`tel:${contact.phone}`}
            className="block text-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Contact Now
          </a>
        </div>
      </div>
    </div>
  );
};

const MovingServicesCardSmall = ({ name, location, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-40 bg-white shadow-md rounded-lg p-4 text-center cursor-pointer transition-transform hover:scale-105"
    >
      <h4 className="text-sm font-semibold text-gray-800 truncate">{name}</h4>
      <p className="text-gray-600 text-xs mt-1">{location}</p>
      <button className="mt-2 text-blue-500 text-xs hover:underline">
        Learn More
      </button>
    </div>
  );
};

const MovingServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);

  const movingServices = [
    {
      name: "Swift Movers",
      contact: { phone: "+1-555-123-4567", email: "contact@swiftmovers.com" },
      locations: ["Kathmnadu", "Bhaktapur", "Pokhara"],
      description:
        "Reliable and affordable moving services for residential and commercial properties.",
      servicesOffered: ["Packing", "Transport", "Unpacking", "Storage"],
    },
    {
      name: "PackSavvy Solutions",
      contact: { phone: "+1-555-987-6543", email: "info@packsavvy.com" },
      locations: ["Miami", "Houston", "New York"],
      description:
        "Specializing in quick and secure moving with a focus on customer satisfaction.",
      servicesOffered: ["Local Moving", "Long-Distance", "Furniture Assembly"],
    },
  ];

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Moving Services
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Need help moving? Explore our trusted partners.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {movingServices.map((service, index) => (
            <MovingServicesCardSmall
              key={index}
              name={service.name}
              location={service.locations[0]} // Show the first location upfront
              onClick={() => setSelectedService(service)}
            />
          ))}
        </div>
      </div>
      {selectedService && (
        <MovingServicePopup
          {...selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </section>
  );
};

export default MovingServicesSection;
