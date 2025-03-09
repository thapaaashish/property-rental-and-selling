// AboutUs.jsx
import React from "react";

const AboutUs = () => {
  // Sample data for team members
  const teamMembers = [
    {
      name: "Aashish Thapa",
      role: "Founder & CEO",
      image:
        "https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741285059/HomeFinder/profile_picture/users/IMG_7537_rmth5z.jpg",
      bio: "John has over 15 years of experience in real estate and technology, passionate about connecting people with their perfect homes.",
    },
  ];

  // Sample data for company values
  const values = [
    {
      title: "Transparency",
      description:
        "We believe in clear and honest communication with our users, ensuring trust at every step.",
    },
    {
      title: "Community",
      description:
        "We foster a community of property owners and renters who support and learn from each other.",
    },
    {
      title: "Innovation",
      description:
        "We constantly innovate to provide the best tools and experiences for our users.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            We're on a mission to make renting and selling properties simple,
            transparent, and accessible for everyone.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At HomeFinder, we aim to empower property owners and renters by
            providing a seamless platform to connect, transact, and thrive.
            Whether you're listing your home or searching for a new one, we're
            here to simplify the process and build trust every step of the way.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 2025, HomeFinder started with a simple idea: to make
                property renting and selling easier for everyone. What began as
                a small project has grown into a trusted platform serving
                thousands of users worldwide.
              </p>
              <p className="text-lg text-gray-600">
                Our team is passionate about real estate and technology, and
                we're committed to creating a marketplace where transparency,
                efficiency, and community come first.
              </p>
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/dwhsjkzrn/image/upload/v1741531987/DALL_E_2025-03-09_20.34.50_-_A_simple_illustration_of_a_diverse_team_working_together_at_a_table._The_team_members_are_discussing_ideas_with_laptops_and_notebooks._The_background_yz8sfj.webp" // Replace with an actual image URL
                alt="Our Story"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Our dedicated team works tirelessly to bring you the best experience
            possible.
          </p>
        </div>

        <div className="items-center">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm mx-auto"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-medium text-gray-900">
                {member.name}
              </h3>
              <p className="text-gray-500">{member.role}</p>
              <p className="text-gray-600 mt-2">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              These core values guide everything we do at HomeFinder.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-blue-600 text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-4">Join Our Community</h2>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Whether you're a property owner or looking for your next home, we're
            here to help you every step of the way.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-full hover:bg-gray-100 transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
