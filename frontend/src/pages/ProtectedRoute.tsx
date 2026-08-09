import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated || !user || !token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role.toUpperCase()
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;