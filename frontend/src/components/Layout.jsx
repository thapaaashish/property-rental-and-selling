import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();

  return (
    <>
      {/* Show header on all pages EXCEPT Add Listing */}
      {location.pathname !== "/add-listing" && <Header />}
      <main className="pt-16">
        <Outlet /> {/* This will render the page content */}
      </main>
    </>
  );
};

export default Layout;
