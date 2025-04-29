import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Images/Logo.png";
import { useSelector, useDispatch } from "react-redux";
import {
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { IoMdMenu } from "react-icons/io";
import { MessageSquare } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profilePopupRef = useRef(null);
  const mobilePopupRef = useRef(null);
  const backdropRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is an admin
  const isAdmin = currentUser && currentUser.role === "admin";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen) {
        if (backdropRef.current && backdropRef.current.contains(event.target)) {
          setIsMobileMenuOpen(false);
          return;
        }
        if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          mobilePopupRef.current &&
          !mobilePopupRef.current.contains(event.target)
        ) {
          setIsMobileMenuOpen(false);
        }
      }

      if (isProfilePopupOpen) {
        if (
          profileButtonRef.current &&
          !profileButtonRef.current.contains(event.target) &&
          profilePopupRef.current &&
          !profilePopupRef.current.contains(event.target)
        ) {
          setIsProfilePopupOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, isProfilePopupOpen]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(`${API_BASE}/api/chat/unread-count`, {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching unread messages count:", error);
      }
    };

    fetchUnreadMessagesCount();

    // Set up interval to check for new messages periodically (every 30 seconds)
    const intervalId = setInterval(fetchUnreadMessagesCount, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfilePopupOpen(false);
  };

  const toggleProfilePopup = (e) => {
    e.stopPropagation();
    setIsProfilePopupOpen(!isProfilePopupOpen);
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = (path) => (e) => {
    e.stopPropagation();
    setIsProfilePopupOpen(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = async (e) => {
    e.stopPropagation();
    try {
      dispatch(signOutUserStart());
      await fetch(`${API_BASE}/api/auth/signout`, { method: "POST" });
      dispatch(signOutUserSuccess());
      setIsProfilePopupOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={scrollToTop} className="flex items-center">
            <img src={logo} alt="HomeFinder Logo" className="h-16 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-4">
              <Link to="/" onClick={scrollToTop}>
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">
                  Home
                </li>
              </Link>
              <Link to="/listings">
                <li className="text-black hover:bg-gray-300 transition duration-300 rounded-lg px-4 py-2">
                  Listings
                </li>
              </Link>
            </ul>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/create-listing-landing">
              <button
                className="
      px-4 py-2 
      text-white font-medium
      bg-teal-500
      rounded-lg
      hover:bg-teal-600
      shadow-sm
      hover:shadow-md
      transition-all duration-300
      flex items-center gap-2  cursor-pointer
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                List Your Property
              </button>
            </Link>

            {/* Messages Icon with Badge */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => navigate("/messages")}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  aria-label="Messages"
                >
                  <MessageSquare className="text-gray-600 w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfilePopup}
                  className="h-10 flex items-center px-2 border border-gray-500 rounded-full gap-1.5 bg-white cursor-pointer hover:shadow-lg"
                >
                  <IoMdMenu className="text-gray-600 w-5 h-5" />
                  <div className="w-7 h-7 rounded-full overflow-hidden">
                    <img
                      src={currentUser.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              ) : (
                <Link to="/sign-in">
                  <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition duration-300 ${
                      isScrolled
                        ? "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "border border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                </Link>
              )}

              {isProfilePopupOpen && (
                <div
                  ref={profilePopupRef}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-xl shadow-lg z-50"
                >
                  <ul className="py-2">
                    {!isAdmin && (
                      <>
                        <li className="border-b border-gray-200 pb-2 mb-2 mx-2">
                          <button
                            onClick={handleMenuItemClick("/profile")}
                            className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                          >
                            Profile
                          </button>
                          <button
                            onClick={handleMenuItemClick("/wishlists")}
                            className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                          >
                            Wishlists
                          </button>
                          <button
                            onClick={handleMenuItemClick("/messages")}
                            className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                          >
                            Messages
                          </button>
                          <button
                            onClick={handleMenuItemClick("/my-bookings")}
                            className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                          >
                            My Bookings
                          </button>
                        </li>
                      </>
                    )}
                    <li className="border-b border-gray-200 pb-2 mb-2 mx-2">
                      <button
                        onClick={handleMenuItemClick("/help-center")}
                        className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        Help Center
                      </button>
                    </li>
                    <li className="border-b border-gray-200 pb-2 mb-2 mx-2">
                      <button
                        onClick={handleMenuItemClick(
                          isAdmin ? "/admin-dashboard" : "/user-dashboard"
                        )}
                        className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        {isAdmin ? "Admin Dashboard" : "User Dashboard"}
                      </button>
                    </li>
                    <li className="mx-2">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    navigate("/messages");
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <MessageSquare className="text-gray-600 w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <button
              ref={mobileMenuRef}
              onClick={toggleMobileMenu}
              className="h-9 flex items-center px-2 border border-gray-500 rounded-full gap-1 bg-white cursor-pointer hover:shadow-lg"
            >
              <IoMdMenu className="text-gray-600 w-4 h-4" />
              {currentUser ? (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              ref={backdropRef}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            />

            <div
              ref={mobilePopupRef}
              className="fixed top-[64px] left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50 md:hidden mx-4"
            >
              <div className="px-4 py-4">
                <ul className="space-y-1">
                  <li className="border-b border-gray-200 pb-2 mb-2">
                    <Link
                      to="/"
                      onClick={() => {
                        scrollToTop();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Home
                    </Link>
                    <Link
                      to="/listings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Listings
                    </Link>
                  </li>

                  <li className="border-b border-gray-200 pb-2 mb-2">
                    <Link to="/create-listing-landing">
                      <button
                        className="
      px-5 py-2.5
      text-white text-sm font-medium
      bg-teal-500
      rounded-lg
      hover:bg-teal-600
      shadow-sm
      hover:shadow-md
      transition-all duration-300
      flex items-center justify-center gap-2
      w-full cursor-pointer
    "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        List Your Property
                      </button>
                    </Link>
                  </li>

                  {currentUser ? (
                    <>
                      {!isAdmin && (
                        <li className="border-b border-gray-200 pb-2 mb-2">
                          <button
                            onClick={handleMenuItemClick("/profile")}
                            className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={handleMenuItemClick("/wishlists")}
                            className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          >
                            Wishlists
                          </button>
                          <button
                            onClick={handleMenuItemClick("/messages")}
                            className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          >
                            Messages
                          </button>
                          <button
                            onClick={handleMenuItemClick("/my-bookings")}
                            className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          >
                            My Bookings
                          </button>
                        </li>
                      )}
                      <li className="border-b border-gray-200 pb-2 mb-2">
                        <button
                          onClick={handleMenuItemClick("/help-center")}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          Help Center
                        </button>
                      </li>
                      <li className="border-b border-gray-200 pb-2 mb-2">
                        <button
                          onClick={handleMenuItemClick(
                            isAdmin ? "/admin-dashboard" : "/user-dashboard"
                          )}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          Log Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link
                        to="/sign-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Sign In
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
