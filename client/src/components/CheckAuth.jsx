import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CheckAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  const isAuthenticated = !!token;

  const protectedRoutes = ["/dashboard", "/profile","/about","/contact"];
  if (
    !isAuthenticated &&
    protectedRoutes.some((path) => location.pathname.startsWith(path))
  ) {
    return <Navigate to="/login" replace />;
  }

  if (
    isAuthenticated &&
    (location.pathname === "/login" || location.pathname === "/signup")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;