import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Images/Logo.png";
import { useSelector, useDispatch } from "react-redux";
import {
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  // Check if the user has scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle navigation for profile menu items
  const handleMenuItemClick = (path) => {
    console.log(`Navigating to: ${path}`);
    setIsProfilePopupOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 10);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      dispatch(signOutUserSuccess());
      setIsProfilePopupOpen(false);
      navigate("/");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-effect border-b border-gray-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="HomeFinder Logo" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-4">
              <Link to="/">
                <li className="text-sm font-medium text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">
                  Home
                </li>
              </Link>
              <Link to="/listings">
                <li className="text-sm font-medium text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">
                  Listings
                </li>
              </Link>
            </ul>
            <div className="flex space-x-4 items-center">
              <Link to="/create-listing">
                <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white rounded-lg transition duration-300 cursor-pointer">
                  Host your Property
                </button>
              </Link>
              {/* Profile Avatar */}
              <div className="relative cursor-pointer" ref={profileRef}>
                {currentUser ? (
                  <button
                    onClick={toggleProfilePopup}
                    className="flex items-center justify-center focus:outline-none group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-md">
                      <img
                        src={currentUser.avatar}
                        alt="User Avatar"
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block"></span>
                  </button>
                ) : (
                  <Link to="/sign-in">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                        isScrolled
                          ? "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          : "border border-black text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                  </Link>
                )}

                {/* Profile Popup */}
                {isProfilePopupOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                      <li>
                        <div
                          onClick={() => handleMenuItemClick("/profile")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Profile
                        </div>
                      </li>
                      <li>
                        <div
                          onClick={() => handleMenuItemClick("/wishlists")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Wishlists
                        </div>
                      </li>
                      <li>
                        <div
                          onClick={() => handleMenuItemClick("/messages")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Messages
                        </div>
                      </li>
                      <li>
                        <div
                          onClick={handleSignOut}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Log Out
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle and Avatar */}
          <div className="md:hidden flex items-center">
            <div className="flex items-center justify-between bg-gray-100 rounded-full px-2 py-1 shadow-sm">
              {/* Hamburger Menu */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 cursor-pointer hover:text-black focus:outline-none"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  // X (Close) Icon
                  <svg
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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
              {/* User Avatar */}
              <div>
                {currentUser ? (
                  <button
                    onClick={toggleProfilePopup}
                    className="flex items-center justify-center"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                      <img
                        src={currentUser.avatar}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                ) : (
                  <Link to="/sign-in">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-4 box-border z-50">
            <ul className="flex flex-col space-y-4 px-4">
              {currentUser ? (
                <div
                  onClick={() => {
                    toggleMobileMenu();
                    navigate("/profile");
                  }}
                >
                  <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                    Profile
                  </li>
                </div>
              ) : (
                <div
                  onClick={() => {
                    toggleMobileMenu();
                    navigate("/sign-in");
                  }}
                >
                  <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                    Sign In
                  </li>
                </div>
              )}
              <div
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/");
                }}
              >
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                  Home
                </li>
              </div>
              <div
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/listings");
                }}
              >
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                  Listings
                </li>
              </div>
              <div
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/create-listing");
                }}
              >
                <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                  Host your Property
                </li>
              </div>
              {currentUser && (
                <div
                  onClick={() => {
                    toggleMobileMenu();
                    navigate("/wishlists");
                  }}
                >
                  <li className="hover:bg-sky-100 rounded-sm p-2 text-slate-700 hover:text-black transition duration-300 cursor-pointer">
                    Wistlists
                  </li>
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
