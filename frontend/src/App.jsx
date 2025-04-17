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
import PublicUserProfilePage from "./pages/PublicUserProfilePage";
import { useNavigate } from "react-router-dom";
import Success from "./components/payment/PaymentSuccess";

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
          <Route path="/user/:userId" element={<PublicUserProfilePage />} />
          <Route path="/payment-success" element={<Success />} />
          <Route path="/payment-failure" element={<Failure />} />
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
          </Route>
        </Route>

        {/* User Private Routes with No Header and No Footer */}
        <Route element={<UserPrivateRoute />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>

        {/* Admin Private Routes with No Header and No Footer */}
        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

const Failure = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Payment Failed!</h1>
      <p>There was an issue with your payment. Please try again.</p>
      <button onClick={() => navigate("/")} className="go-home-button">
        Go to Homepage
      </button>
    </div>
  );
};
