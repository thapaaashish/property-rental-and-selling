import React from 'react';
import { Home, Users, Building, ListPlus } from 'lucide-react';

const features = [
  {
    icon: Home,
    title: 'Find your future home',
    description: 'We help you find a home by offering a smart real estate experience'
  },
  {
    icon: Users,
    title: 'Experienced agents',
    description: 'Find an experienced agent who knows your market best'
  },
  {
    icon: Building,
    title: 'Buy or rent homes',
    description: 'Whether you\'re buying or renting, we have you covered'
  },
  {
    icon: ListPlus,
    title: 'List your own property',
    description: 'Sign up now and list your property for free'
  }
];
export default function Features() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Us
          </h2>
          <p className="text-gray-600">
            We provide a complete service for the sale, purchase or rental of real estate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-full">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}