import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Images/Logo.png";
import { useSelector, useDispatch } from "react-redux";
import {
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { signoutAdmin } from "../redux/admin/adminSlice";
import { IoMdMenu } from "react-icons/io";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentAdmin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const profileButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profilePopupRef = useRef(null);
  const mobilePopupRef = useRef(null);
  const navigate = useNavigate();

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
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target) &&
        mobilePopupRef.current &&
        !mobilePopupRef.current.contains(event.target)
      ) {
        setIsProfilePopupOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (currentAdmin) {
        await fetch("/api/admin/signout", { method: "POST" });
        dispatch(signoutAdmin());
      } else if (currentUser) {
        dispatch(signOutUserStart());
        await fetch("/api/auth/signout", { method: "POST" });
        dispatch(signOutUserSuccess());
      }
      setIsProfilePopupOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      if (currentAdmin) {
        console.error("Admin sign out failed:", error);
      } else {
        dispatch(signOutUserFailure(error.message));
      }
    }
  };

  const isAdmin = !!currentAdmin;
  const currentEntity = currentAdmin || currentUser;

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
            <div className="relative">
              {currentEntity ? (
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfilePopup}
                  className="h-10 flex items-center px-2 border border-gray-500 rounded-full gap-1.5 bg-white cursor-pointer hover:shadow-lg"
                >
                  <IoMdMenu className="text-gray-600 w-5 h-5" />
                  <div className="w-7 h-7 rounded-full overflow-hidden">
                    <img
                      src={currentEntity.avatar}
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
                      </li>
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

          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuRef}
              onClick={toggleMobileMenu}
              className="h-9 flex items-center px-2 border border-gray-500 rounded-full gap-1 bg-white cursor-pointer hover:shadow-lg"
            >
              <IoMdMenu className="text-gray-600 w-4 h-4" />
              {currentEntity ? (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <img
                    src={currentEntity.avatar}
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

        {isMobileMenuOpen && (
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

                {currentEntity ? (
                  <>
                    <li className="border-b border-gray-200 pb-2 mb-2">
                      {!isAdmin && (
                        <>
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
                        </>
                      )}
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
        )}
      </div>
    </header>
  );
};

export default Header;
