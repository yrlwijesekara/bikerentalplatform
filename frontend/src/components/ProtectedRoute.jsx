import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = "/login" }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Check if user is authenticated
    if (!token) {
      navigate(redirectTo);
      return;
    }

    // Check if user has required role
    if (requiredRole && role !== requiredRole) {
      // Redirect to appropriate dashboard based on actual role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "vendor":
          navigate("/vendor/dashboard");
          break;
        case "user":
          navigate("/find-bikes");
          break;
        default:
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          break;
      }
      return;
    }
  }, [navigate, requiredRole, redirectTo]);

  // If we get here, user is authenticated and has correct role
  return children;
};

export default ProtectedRoute;