import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import CreateListing from "./pages/CreateListing";
import ForgotPassword from "./pages/ForgotPassword";
import PropertyListing from "./components/PropertyListing";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Listings from "./pages/Listings";
import SavedListings from "./pages/SavedListings";

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
          <Route path="/about" element={<About />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/property/:id" element={<PropertyListing />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/saved-listings" element={<SavedListings />} />
        </Route>

        {/* Keep pages outside Layout (No Header Here) */}
        <Route element={<PrivateRoute />}>
          <Route path="/create-listing" element={<CreateListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
