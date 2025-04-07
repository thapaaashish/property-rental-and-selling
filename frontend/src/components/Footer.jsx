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
import { motion } from "framer-motion"; // Import Framer Motion
import logo from "../Images/Logo.png";
import { Link } from "react-router-dom";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const iconHover = {
  scale: 1.2,
  rotate: 10,
  transition: { duration: 0.3 },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {/* Company Info */}
          <motion.div variants={fadeInUp}>
            <Link to="/" onClick={scrollToTop} className="inline-block mb-6">
              <motion.img
                src={logo}
                alt="HomeFinder Logo"
                className="h-16 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Your trusted partner in finding the perfect home. We connect
              buyers and sellers to turn real estate dreams into reality.
            </p>
            <div className="flex space-x-4">
              {[
                {
                  href: "https://www.facebook.com/taashish510",
                  icon: Facebook,
                  color: "hover:bg-blue-600",
                },
                {
                  href: "https://www.instagram.com/aa.shish__/",
                  icon: Instagram,
                  color: "hover:bg-pink-600",
                },
                {
                  href: "https://www.linkedin.com/in/aashish-thapa-7707a025a/",
                  icon: Linkedin,
                  color: "hover:bg-blue-500",
                },
                { href: "#", icon: Twitter, color: "hover:bg-blue-400" },
                { href: "#", icon: Youtube, color: "hover:bg-red-600" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-800 p-2 rounded-full ${social.color} transition-colors duration-300`}
                  whileHover={iconHover}
                  aria-label={`Visit our ${social.icon.name}`}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-bold text-white mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-teal-500 after:left-0 after:bottom-0 after:-mb-2">
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/listings", label: "Properties" },
                { to: "/about-us", label: "About Us" },
                { to: "/blog", label: "Blog" },
                { to: "/help-center", label: "Help Center" },
              ].map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={link.to}
                    onClick={link.to === "/" ? scrollToTop : null}
                    className="flex items-center text-gray-300 hover:text-teal-400 transition-colors duration-200"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-bold text-white mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-teal-500 after:left-0 after:bottom-0 after:-mb-2">
              Services
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/listings", label: "Buy Property" },
                { to: "/create-listing", label: "Sell Property" },
                { to: "/listings", label: "Rent Property" },
                { to: "/mortgage", label: "Mortgage Services" },
              ].map((service, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={service.to}
                    className="flex items-center text-gray-300 hover:text-teal-400 transition-colors duration-200"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>{service.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-bold text-white mb-6 relative after:absolute after:content-[''] after:w-12 after:h-1 after:bg-teal-500 after:left-0 after:bottom-0 after:-mb-2">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  123 Malighau, Kathmandu, Sano Gaucharan
                </span>
              </li>
              <motion.li
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Phone className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                <a
                  href="tel:+9771234567890"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-200 text-sm"
                >
                  +977 1234567890
                </a>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Mail className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                <a
                  href="mailto:taashish510@gmail.com"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-200 text-sm"
                >
                  taashish510@gmail.com
                </a>
              </motion.li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Mon - Fri: 9:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} HomeFinder. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-6">
            {[
              { to: "/privacy-policy", label: "Privacy Policy" },
              { to: "/terms-of-service", label: "Terms of Service" },
              { to: "/cookies", label: "Cookies" },
              { to: "/sitemap", label: "Sitemap" },
            ].map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={link.to}
                  className="text-gray-400 text-sm hover:text-teal-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
