import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute — wraps a route element and redirects to /login if the user
 * is not authenticated, or to /dashboard if the user lacks the required role.
 *
 * Props:
 *   children  — the protected element to render
 *   roles     — optional array of allowed roles e.g. ['Admin', 'Donor']
 */
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // While the auth context is resolving the stored token, render nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Authenticated but wrong role — redirect to their default dashboard
    const fallback =
      role === "Admin"
        ? "/admin-dashboard"
        : role === "Donor"
          ? "/donor-dashboard"
          : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default PrivateRoute;
