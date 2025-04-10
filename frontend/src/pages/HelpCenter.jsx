import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Home,
  Calendar,
  CreditCard,
  FileText,
  Lock,
  XCircle,
} from "lucide-react";

const HelpCenter = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const popularTopics = [
    { title: "List a Property", link: "#listing", icon: Home },
    { title: "Manage Bookings", link: "#bookings", icon: Calendar },
    { title: "Payments & Pricing", link: "#payments", icon: CreditCard },
    { title: "Rental Agreements", link: "#agreements", icon: FileText },
    { title: "Safety Guidelines", link: "#safety", icon: Lock },
    { title: "Cancellation Policy", link: "#cancellation", icon: XCircle },
  ];

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Visit the homepage and click 'Sign Up' in the top-right corner. Provide your email, create a password, and verify your account via the confirmation email.",
    },
    {
      question: "How do I list my property?",
      answer:
        "Log in, navigate to 'User Dashboard', and select 'Create Listing'. Complete the form with your property details and submit it for approval.",
    },
    {
      question: "How can I contact a property owner?",
      answer:
        "After logging in, view the property details and use the 'Message Owner' option to send a direct message through our platform.",
    },
    {
      question: "What are the cancellation policies?",
      answer:
        "Policies vary by listing. Check the specific property’s details page under 'Cancellation Policy' before booking.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Go to 'User Dashboard', click 'Profile Settings', and edit your information. Save changes to update your profile.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header Section */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold">Help Center</h1>
          <p className="mt-2 text-gray-600">
            Answers to common questions and support options.
          </p>
          {/* <div className="mt-6 relative max-w-md mx-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm"
            />
          </div> */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Popular Topics */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Popular Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.link}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <topic.icon className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium">{topic.title}</span>
              </a>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-gray-100"
                >
                  <span className="text-sm font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-sm text-gray-600 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Contact Support
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Reach out for personalized assistance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Mail className="h-6 w-6 text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1">Email</h3>
              <p className="text-sm text-gray-600">
                <a
                  href="mailto:support@yourplatform.com"
                  className="hover:text-gray-900"
                >
                  taashish510@gmail.com
                </a>
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Phone className="h-6 w-6 text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1">Phone</h3>
              <p className="text-sm text-gray-600">+977 9866329288</p>
            </div>
            {/* <div className="p-4 border border-gray-200 rounded-lg">
              <MessageSquare className="h-6 w-6 text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1">Chat</h3>
              <p className="text-sm text-gray-600">Available 24/7</p>
            </div> */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpCenter;
