import React, { useState } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaEnvelope,
  FaPhone,
  FaComments,
} from "react-icons/fa"; // Using react-icons for icons

const HelpCenter = () => {
  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);

  // Toggle FAQ accordion
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Sample data for popular topics and FAQs
  const popularTopics = [
    { title: "How to list a property", link: "#", icon: "🏠" },
    { title: "Managing bookings", link: "#", icon: "📅" },
    { title: "Payment and pricing", link: "#", icon: "💳" },
    { title: "Rental agreements", link: "#", icon: "📝" },
    { title: "Safety and security", link: "#", icon: "🔒" },
    { title: "Cancellation policies", link: "#", icon: "❌" },
  ];

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        'To create an account, click on the "Sign Up" button at the top right corner of the homepage and follow the instructions.',
    },
    {
      question: "How can I list my property for rent?",
      answer:
        'After logging in, go to the "List Your Property" section, fill out the details about your property, and submit it for review.',
    },
    {
      question: "What are the fees for listing a property?",
      answer:
        "We charge a small commission per booking. Check our pricing page for more details.",
    },
    {
      question: "How do I contact a property owner?",
      answer:
        "You can message the property owner directly through the platform after selecting a property.",
    },
    {
      question: "What is the cancellation policy?",
      answer:
        "Cancellation policies vary by property. Please review the cancellation policy listed on the property's page before booking.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-2 text-gray-600">
            Find answers to your questions or get in touch with us.
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full py-3 pl-10 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Popular Topics Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Popular Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.link}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{topic.icon}</span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {topic.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <FaChevronDown
                    className={`transform transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to assist you. Reach out to us anytime.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <FaEnvelope className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Us
              </h3>
              <p className="text-gray-600">taashish510@gmail.com</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <FaPhone className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Call Us
              </h3>
              <p className="text-gray-600">+(977) 9866-329-288</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <FaComments className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Live Chat
              </h3>
              <p className="text-gray-600">Available 24/7</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
