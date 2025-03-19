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
import Wistlists from "./pages/Wishlists";
import ListingLandingPage from "./pages/ListingLandingPage";
import UserDashboard from "./pages/UserDashboard";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all pages that should include Header inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route element={<UserPrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/wishlists" element={<Wistlists />} />
          <Route
            path="/create-listing-landing"
            element={<ListingLandingPage />}
          />
        </Route>

        {/* Keep pages outside Layout (No Header Here) */}
        <Route element={<UserPrivateRoute />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>

        {/* <Route element={<AdminPrivateRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
