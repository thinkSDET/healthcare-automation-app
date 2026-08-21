/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

type NavItem = {
  to: string;
  label: string;
};

function getPrimaryNav(role?: string): NavItem[] {
  const normalized = role?.toUpperCase();

  if (normalized === "ADMIN" || normalized === "DOCTOR") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/patients", label: "Patients" },
      { to: "/doctors", label: "Doctors" },
      { to: "/appointments", label: "Appointments" },
      { to: "/appointment-requests", label: "Appt Requests" },
      { to: "/refill-requests", label: "Refills" },
      { to: "/lab-orders", label: "Lab Orders" },
      ...(normalized === "ADMIN"
        ? [
            { to: "/inventory", label: "Inventory" },
            { to: "/replenishment-requests", label: "Replenish" },
            { to: "/audit-logs", label: "Audit Logs" },
          ]
        : []),
    ];
  }

  if (normalized === "VIEWER" || normalized === "SUPPORT") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/audit-logs", label: "Audit Logs" },
    ];
  }

  if (normalized === "PATIENT") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/my/profile", label: "My Profile" },
      { to: "/my/appointments", label: "My Appointments" },
      { to: "/my/prescriptions", label: "My Prescriptions" },
      { to: "/my/lab-orders", label: "My Lab Results" },
      { to: "/my/orders", label: "My Orders" },
    ];
  }

  if (normalized === "PHARMACIST") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/pharmacy", label: "Pharmacy" },
      { to: "/inventory", label: "Inventory" },
      { to: "/replenishment-requests", label: "Replenish" },
      { to: "/refill-requests", label: "Refills" },
    ];
  }

  return [{ to: "/dashboard", label: "Dashboard" }];
}

function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingDoctorRequestCount, setPendingDoctorRequestCount] =
    useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || user?.email || "User";

  const roleLabel = user?.role?.toUpperCase() || "";

  const primaryNav = getPrimaryNav(user?.role);

  useEffect(() => {
    if (roleLabel !== "ADMIN") {
      setPendingDoctorRequestCount(0);
      return;
    }

    let cancelled = false;

    const fetchPendingDoctorRequestCount = async () => {
      try {
        const response = await api.get(
          "/doctors/registration-requests/pending-count"
        );

        if (!cancelled) {
          setPendingDoctorRequestCount(
            Number(response.data?.data?.count ?? 0)
          );
        }
      } catch {
        if (!cancelled) {
          setPendingDoctorRequestCount(0);
        }
      }
    };

    fetchPendingDoctorRequestCount();

    const intervalId = window.setInterval(
      fetchPendingDoctorRequestCount,
      15000
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [roleLabel]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-brand">
          <Link to="/dashboard" className="app-brand-link">
            <span className="app-brand-mark">H</span>
            <span className="app-brand-text">HealthOps</span>
          </Link>
        </div>

        <nav className="app-header-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "app-nav-link app-nav-link-active"
                  : "app-nav-link"
              }
              end={item.to === "/dashboard"}
            >
              {item.label}
            </NavLink>
          ))}

          {roleLabel === "ADMIN" && (
            <NavLink
              to="/doctor-registration-requests"
              className={({ isActive }) =>
                isActive
                  ? "app-nav-link app-nav-link-active"
                  : "app-nav-link"
              }
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <span>Doctor Requests</span>
                {pendingDoctorRequestCount > 0 && (
                  <span
                    aria-label={`${pendingDoctorRequestCount} pending doctor requests`}
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 5px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",
                      background: "#dc2626",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {pendingDoctorRequestCount > 99
                      ? "99+"
                      : pendingDoctorRequestCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}
        </nav>

        <div className="app-header-user" ref={menuRef}>
          <button
            type="button"
            className="app-user-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="app-user-meta">
              <span className="app-user-name">{displayName}</span>
              <span className="app-user-role">{roleLabel}</span>
            </span>
            <span className="app-user-caret" aria-hidden>
              ▾
            </span>
          </button>

          {menuOpen && (
            <div className="app-user-menu" role="menu">
              <Link
                to="/dashboard"
                className="app-user-menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/change-password"
                className="app-user-menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Change Password
              </Link>
              <button
                type="button"
                className="app-user-menu-item app-user-menu-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;