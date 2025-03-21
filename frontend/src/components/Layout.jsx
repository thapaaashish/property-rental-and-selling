import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();

  return (
    <>
      {/* Show header on all pages EXCEPT Add Listing */}
      <Header />
      <main className="mt-14">
        <Outlet /> {/* This will render the page content */}
      </main>
      {location.pathname !== "/wishlists" && <Footer />}
    </>
  );
};

export default Layout;
