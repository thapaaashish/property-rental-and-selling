import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ header = true, footer = true }) => {
  const location = useLocation();

  return (
    <>
      {header && <Header />}
      <main className={header ? "mt-14" : "mt-0"}>
        <Outlet /> {/* This will render the page content */}
      </main>
      {footer && location.pathname !== "/wishlists" && <Footer />}
    </>
  );
};

export default Layout;
