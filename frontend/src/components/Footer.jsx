import React from "react";
import {
  Home,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import logo from "../Images/Logo.png";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link to="/" onClick={scrollToTop} className="inline-block mb-6">
              <img src={logo} alt="HomeFinder Logo" className="h-16 w-auto" />
            </Link>
            <p className="text-gray-300 mb-6">
              Your trusted partner in finding the perfect home. We help connect
              buyers and sellers to make real estate dreams come true.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/taashish510"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/aa.shish__/"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/aashish-thapa-7707a025a/"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-500 transition duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition duration-200"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-blue-500 after:left-0 after:bottom-0 after:-mb-2">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/listings"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Properties</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Help Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-blue-500 after:left-0 after:bottom-0 after:-mb-2">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/listings"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Buy Property</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/create-listing"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Sell Property</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/listings"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Rent Property</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/mortgage"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Mortgage Services</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-blue-500 after:left-0 after:bottom-0 after:-mb-2">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-blue-400" />
                <span className="text-gray-300">
                  123 Malighau, Kathmandu, Sano Gaucharan
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <a
                  href="tel:+9771234567890"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  +977 1234567890
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <a
                  href="mailto:taashish510@gmail.com"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  taashish510@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-blue-400" />
                <span className="text-gray-300">
                  Mon - Fri: 9:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} HomeFinder. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy-policy"
              className="text-gray-400 text-sm hover:text-blue-400 transition duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-400 text-sm hover:text-blue-400 transition duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-400 text-sm hover:text-blue-400 transition duration-200"
            >
              Cookies
            </Link>
            <Link
              to="/sitemap"
              className="text-gray-400 text-sm hover:text-blue-400 transition duration-200"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
