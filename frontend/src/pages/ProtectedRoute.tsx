/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } =
    useAuth();

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0
  ) {
    const currentRole =
      user?.role?.toUpperCase();

    const isAllowed =
      !!currentRole &&
      allowedRoles
        .map((role) =>
          role.toUpperCase()
        )
        .includes(currentRole);

    if (!isAllowed) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;