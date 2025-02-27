import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../Images/Logo.png';
import { useSelector } from 'react-redux';

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const profileRef = useRef(null);

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

  // Toggle profile popup
  const toggleProfilePopup = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
  };

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfilePopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <img
              src={logo}
              alt="HomeFinder Logo"
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              <Link to="/">
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">Home</li>
              </Link>
              <Link to="/listings">
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">Listings</li>
              </Link>
            </ul>
            <div className="flex space-x-4">
              <Link to="/add-listing">
                <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white rounded-lg transition duration-300">
                  Host your Property
                </button>
              </Link>

              {/* Profile Avatar */}
              <div className="relative" ref={profileRef}>
                {currentUser ? (
                  <button
                    onClick={toggleProfilePopup}
                    className="flex items-center justify-center"
                  >
                  <img
                  src={currentUser.avatar}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                    
                  </button>
                ) : (
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
                )}

                {/* Profile Popup */}
                {isProfilePopupOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul className="py-2">
                      <li>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Messages
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Favorites
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/payments"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Payments
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            // Handle logout logic here
                            console.log('Logged out');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle Button with dynamic icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 cursor-pointer hover:text-black focus:outline-none transition-all duration-300"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                // X (Close) Icon
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger (Menu) Icon
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
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-4 box-border">
            <ul className="flex flex-col space-y-4 px-4">
              <Link to="/" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300">Home</li>
              </Link>
              <Link to="/listings" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300">Listings</li>
              </Link>
              <Link to="/add-listing" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300">
                  Host your Property
                </li>
              </Link>
              <Link to="/sign-in" onClick={toggleMobileMenu}>
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300">Sign In</li>
              </Link>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;