import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if the user has scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent backdrop-blur-xs'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="font-bold text-xl sm:text-2xl flex space-x-2">
              <span className="text-slate-600">Property</span>
              <span className="text-black">Rental</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              <Link to="/">
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">Home</li>
              </Link>
              <Link to="/about">
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">About</li>
              </Link>
            </ul>
            <div className="flex space-x-4">
              <Link to="/add-listing">
                <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white rounded-lg transition duration-300">
                  Host your Property
                </button>
              </Link>
              <Link to="/sign-in">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                    isScrolled
                      ? 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                      : 'border border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 cursor-pointer hover:text-black focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-4 box-border">
            <ul className="flex flex-col space-y-4 px-4">
              <Link to="/" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm text-slate-700 hover:text-black transition duration-300">Home</li>
              </Link>
              <Link to="/about" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm text-slate-700 hover:text-black transition duration-300">About</li>
              </Link>
              <Link to="/add-listing" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm text-slate-700 hover:text-black transition duration-300">
                  Host your Property
                </li>
              </Link>
              <Link to="/sign-in" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm text-slate-700 hover:text-black transition duration-300">Sign In</li>
              </Link>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;