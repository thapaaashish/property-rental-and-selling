import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AboutUs from "./pages/AboutUs";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import CreateListing from "./pages/CreateListing";
import ForgotPassword from "./pages/ForgotPassword";
import PropertyDetails from "./components/PropertyDetails";
import Layout from "./components/Layout";
import { UserPrivateRoute, AdminPrivateRoute } from "./components/PrivateRoute";
import Listings from "./pages/Listings";
import AdminDashboard from "./pages/AdminDashboard";
import HelpCenter from "./pages/HelpCenter";
import Wishlists from "./pages/Wishlists";
import ListingLandingPage from "./pages/ListingLandingPage";
import UserDashboard from "./pages/UserDashboard";
import MyBookings from "./pages/Booking/MyBookings";
// import Notifications from "./pages/Notifications";
import axios from "axios";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Header and Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/help-center" element={<HelpCenter />} />
        </Route>

        {/* User Private Routes with Header and Footer */}
        <Route element={<UserPrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bookings" element={<MyBookings />} />

            <Route
              path="/create-listing-landing"
              element={<ListingLandingPage />}
            />
          </Route>
        </Route>

        {/* User Private Routes with Header Only (No Footer) */}
        <Route element={<UserPrivateRoute />}>
          <Route element={<Layout footer={false} />}>
            <Route path="/wishlists" element={<Wishlists />} />
            {/* <Route path="/notifications" element={<Notifications />} /> */}
          </Route>
        </Route>

        {/* User Private Routes with No Header and No Footer */}
        <Route element={<UserPrivateRoute />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* //Admin Private Routes with No Header and No Footer
        <Route element={<AdminPrivateRoute />}>
          
        </Route> */}

        {/* Uncomment if you add a Payment page - Customize as needed */}
        {/* <Route path="/payment" element={<Payment />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
