import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export const UserPrivateRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
};

export const AdminPrivateRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  // Check if user is authenticated and has admin role
  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }
  if (currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
