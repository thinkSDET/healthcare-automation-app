import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  patientId?: number | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;

  login: (
    user: User,
    token: string,
    rememberMe?: boolean
  ) => void;

  logout: () => void;

  isAuthenticated: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE HELPERS
========================================================= */

const getStoredValue = (key: string) => {
  return (
    localStorage.getItem(key) ||
    sessionStorage.getItem(key)
  );
};

const removeStoredValue = (key: string) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

/**
 * New tabs do not share sessionStorage with the opener.
 * When Track Shipment (or similar) opens a same-origin tab
 * without noopener, copy auth into this tab's sessionStorage
 * so ProtectedRoute sees an authenticated session.
 */
const hydrateAuthFromOpener = () => {
  if (
    getStoredValue("token") &&
    getStoredValue("user")
  ) {
    return;
  }

  try {
    const opener = window.opener as Window | null;

    if (!opener || opener.closed) {
      return;
    }

    const openerToken =
      opener.sessionStorage.getItem("token") ||
      opener.localStorage.getItem("token");

    const openerUser =
      opener.sessionStorage.getItem("user") ||
      opener.localStorage.getItem("user");

    const openerRememberMe =
      opener.sessionStorage.getItem("rememberMe") ||
      opener.localStorage.getItem("rememberMe");

    if (!openerToken || !openerUser) {
      return;
    }

    sessionStorage.setItem("token", openerToken);
    sessionStorage.setItem("user", openerUser);

    if (openerRememberMe != null) {
      sessionStorage.setItem(
        "rememberMe",
        openerRememberMe
      );
    }
  } catch {
    // Cross-origin opener or storage access blocked.
  }
};

/** Read JWT from localStorage or sessionStorage (remember-me safe). */
export const getAuthToken = () => {
  return getStoredValue("token");
};

/* =========================================================
   JWT EXPIRY
========================================================= */

const decodeTokenExpiry = (
  token: string
): number | null => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    /*
     * JWT uses Base64URL.
     * Convert it to normal Base64 before atob().
     */

    let base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const payload = JSON.parse(
      atob(base64)
    );

    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch (error) {
    console.error(
      "Failed to decode JWT:",
      error
    );

    return null;
  }
};

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  /* =======================================================
     INITIAL USER
  ======================================================= */

  const [user, setUser] =
    useState<User | null>(() => {
      hydrateAuthFromOpener();

      const storedUser =
        getStoredValue("user");

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    });

  /* =======================================================
     INITIAL TOKEN
  ======================================================= */

  const [token, setToken] =
    useState<string | null>(() => {
      hydrateAuthFromOpener();
      return getStoredValue("token");
    });

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    removeStoredValue("user");
    removeStoredValue("token");
    removeStoredValue("rememberMe");

    setUser(null);
    setToken(null);
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = (
    user: User,
    token: string,
    rememberMe = false
  ) => {
    /*
     * Clear previous authentication data
     */

    removeStoredValue("user");
    removeStoredValue("token");
    removeStoredValue("rememberMe");

    /*
     * Remember Me:
     *
     * checked    -> localStorage
     * unchecked  -> sessionStorage
     */

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem(
      "user",
      JSON.stringify(user)
    );

    storage.setItem(
      "token",
      token
    );

    storage.setItem(
      "rememberMe",
      String(rememberMe)
    );

    /*
     * Update React state
     */

    setUser(user);
    setToken(token);
  };

  /* =======================================================
     SESSION TIMEOUT
  ======================================================= */

 useEffect(() => {
  if (!token) {
    return;
  }

  const checkSessionExpiry = () => {
    const expiry = decodeTokenExpiry(token);

    if (!expiry) {
      console.warn(
        "Unable to determine JWT expiry."
      );
      return;
    }

    const remainingTime =
      expiry - Date.now();

    console.log(
      "Token expires at:",
      new Date(expiry).toLocaleString()
    );

    console.log(
      "Remaining session time:",
      Math.round(
        remainingTime / 1000 / 60
      ),
      "minutes"
    );

    // Token already expired
    if (remainingTime <= 0) {
      alert(
        "Your session has expired. Please login again."
      );

      logout();
      return;
    }

    /*
     * Browser setTimeout maximum delay is
     * approximately 24.8 days.
     *
     * Remember Me token = 30 days.
     *
     * Therefore, never pass more than
     * MAX_TIMEOUT to setTimeout.
     */

    const MAX_TIMEOUT =
      2147483647;

    const timeout =
      Math.min(
        remainingTime,
        MAX_TIMEOUT
      );

    const timer =
      window.setTimeout(() => {
        /*
         * If the actual JWT expiry is still
         * further away, check again.
         *
         * This handles long-lived tokens such
         * as the 30-day Remember Me token.
         */
        checkSessionExpiry();
      }, timeout);

    return timer;
  };

  const timer =
    checkSessionExpiry();

  return () => {
    if (timer) {
      window.clearTimeout(timer);
    }
  };
}, [token]);

  /* =======================================================
     CONTEXT
  ======================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated:
          !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   USE AUTH
========================================================= */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};