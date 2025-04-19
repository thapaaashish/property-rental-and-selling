import React from "react";
import MovingServicesSection from "../components/MovingServicesCard";

const MovingServices = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-top justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <MovingServicesSection />
      </div>
    </div>
  );
};

export default MovingServices;
