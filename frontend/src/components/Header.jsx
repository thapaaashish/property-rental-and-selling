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
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { Bell } from "lucide-react";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profilePopupRef = useRef(null);
  const mobilePopupRef = useRef(null);
  const notificationRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const backdropRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await axios.put(`/api/notifications/${notification._id}/read`);

      if (notification.relatedEntityModel === "Booking") {
        navigate(`/bookings/${notification.relatedEntity}`);
      }

      setNotifications(
        notifications.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(unreadCount - 1);
      setIsNotificationOpen(false);
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfilePopupOpen(false);
    setIsMobileMenuOpen(false);
  };

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
      // Mobile menu
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

      // Profile popup
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

      // Notification popup
      if (isNotificationOpen) {
        if (
          notificationButtonRef.current &&
          !notificationButtonRef.current.contains(event.target) &&
          notificationRef.current &&
          !notificationRef.current.contains(event.target)
        ) {
          setIsNotificationOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, isProfilePopupOpen, isNotificationOpen]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfilePopupOpen(false);
    setIsNotificationOpen(false);
  };

  const toggleProfilePopup = (e) => {
    e.stopPropagation();
    setIsProfilePopupOpen(!isProfilePopupOpen);
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  };

  const handleMenuItemClick = (path) => (e) => {
    e.stopPropagation();
    setIsProfilePopupOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
    navigate(path);
  };

  const handleSignOut = async (e) => {
    e.stopPropagation();
    try {
      dispatch(signOutUserStart());
      await fetch("/api/auth/signout", { method: "POST" });
      dispatch(signOutUserSuccess());
      setIsProfilePopupOpen(false);
      setIsMobileMenuOpen(false);
      setIsNotificationOpen(false);
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
              <button className="px-3 py-1.5 text-sm font-medium text-black hover:bg-black hover:text-white rounded-lg transition duration-300 cursor-pointer">
                List Your Property
              </button>
            </Link>

            {/* Notification Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  onClick={toggleNotifications}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
                  aria-label="Notifications"
                >
                  <Bell className="text-gray-600 w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
                  )}
                </button>

                {isNotificationOpen && (
                  <div
                    ref={notificationRef}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg z-50 text-sm"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        Notifications
                      </span>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-gray-500 hover:text-black cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                              !notification.read ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-100`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-900">
                                {notification.title}
                              </span>
                              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-gray-200 text-center">
                      <button
                        onClick={() => {
                          navigate("/notifications");
                          setIsNotificationOpen(false);
                        }}
                        className="text-xs text-gray-500 hover:text-black cursor-pointer"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
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
                        onClick={handleMenuItemClick("/my-bookings")}
                        className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        My Bookings
                      </button>
                    </li>
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
                        onClick={handleMenuItemClick("/user-dashboard")}
                        className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg"
                      >
                        User Dashboard
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
              <button
                ref={notificationButtonRef}
                onClick={toggleNotifications}
                className="p-1 rounded-full hover:bg-gray-200 relative"
              >
                <IoMdNotificationsOutline className="text-gray-600 w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
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
                    <Link
                      to="/create-listing-landing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      List Your Property
                    </Link>
                  </li>

                  {currentUser && (
                    <li className="border-b border-gray-200 pb-2 mb-2">
                      <button
                        onClick={() => {
                          navigate("/notifications");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        <IoMdNotificationsOutline className="text-gray-600 w-5 h-5" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    </li>
                  )}

                  {currentUser ? (
                    <>
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
                          onClick={handleMenuItemClick("/my-bookings")}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          My Bookings
                        </button>
                        <button
                          onClick={handleMenuItemClick("/help-center")}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          Help Center
                        </button>
                      </li>

                      <li className="border-b border-gray-200 pb-2 mb-2">
                        <button
                          onClick={handleMenuItemClick("/user-dashboard")}
                          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          User Dashboard
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
