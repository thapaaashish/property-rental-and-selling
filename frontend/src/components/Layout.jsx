import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ header = true, footer = true }) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {header && <Header />}
      <main className={header ? "mt-14" : "mt-0"}>
        <Outlet />
      </main>
      {footer && !["/sign-in", "/sign-up"].includes(location.pathname) && <Footer />}
    </>
  );
};

export default Layout;