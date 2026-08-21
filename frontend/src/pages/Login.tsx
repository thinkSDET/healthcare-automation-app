/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
            rememberMe,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Invalid email or password"
        );
      }

      const { token, user } =
        result.data;

      /*
       * Pass rememberMe to AuthContext
       *
       * AuthContext will decide whether
       * to store the session in:
       *
       * localStorage  -> Remember Me checked
       * sessionStorage -> Remember Me unchecked
       */
      login(
        user,
        token,
        rememberMe
      );

      // Role based login
      switch (
        user.role?.toUpperCase()
      ) {
        case "ADMIN":
          navigate("/dashboard");
          break;

        case "DOCTOR":
          navigate("/dashboard");
          break;

        case "PHARMACIST":
          navigate("/dashboard");
          break;

        case "PATIENT":
          navigate("/dashboard");
          break;

        default:
          navigate("/dashboard");
      }

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <section className="login-brand-panel">
        <div className="brand-top">
          <div className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="presentation">
              <path d="M19 5h10v12h12v10H29v16H19V27H7V17h12V5Z" />
            </svg>
          </div>
          <div>
            <h1>Health<span>Ops</span></h1>
            <p>Healthcare Operations Platform</p>
          </div>
        </div>

        <div className="brand-message">
          <p className="brand-eyebrow">HEALTHCARE, CONNECTED</p>
          <h2>
            One platform.<br />
            <span>Every healthcare workflow.</span>
          </h2>
          <p className="brand-description">
            Streamline operations, enhance patient care, and empower your
            healthcare ecosystem.
          </p>
        </div>

        <div className="healthcare-modules" aria-hidden="true">
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24"><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm3 11v-1.5a3.5 3.5 0 0 0-3.5-3.5H16" /></svg>
            </div>
            <span>Patients</span>
          </div>
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24"><path d="M8 3v5a4 4 0 0 0 8 0V3M5 3h6M13 3h6M12 12v9M8 21h8" /></svg>
            </div>
            <span>Doctors</span>
          </div>
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3" /></svg>
            </div>
            <span>Appointments</span>
          </div>
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 10a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18L14 8V3M7 16h10" /></svg>
            </div>
            <span>Labs</span>
          </div>
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24"><path d="m8.5 7.5 3-3a3.5 3.5 0 0 1 5 5l-2 2M15.5 16.5l-3 3a3.5 3.5 0 0 1-5-5l2-2M9 15l6-6" /></svg>
            </div>
            <span>Pharmacy</span>
          </div>
        </div>

        <div className="brand-visual" aria-hidden="true">
          <div className="visual-grid" />
          <div className="visual-cross cross-one">+</div>
          <div className="visual-cross cross-two">+</div>
          <div className="heartbeat">
            <svg viewBox="0 0 700 100" preserveAspectRatio="none">
              <path d="M0 55H115L145 55 165 30 190 80 215 55H310L335 55 350 42 370 67 390 55H500L525 55 548 20 570 84 595 55H700" />
            </svg>
          </div>
          <div className="hospital-silhouette">
            <div className="hospital-building building-main">
              <span className="hospital-cross">+</span>
            </div>
            <div className="hospital-building building-side" />
            <div className="hospital-building building-small" />
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>All systems operational</strong>
            <span>Last updated: Just now</span>
          </div>
        </div>
      </section>

      <section className="login-content">
        <div className="login-card">
          <div className="mobile-brand">
            <div className="mobile-brand-logo" aria-hidden="true">
              <svg viewBox="0 0 48 48"><path d="M19 5h10v12h12v10H29v16H19V27H7V17h12V5Z" /></svg>
            </div>
            <div>
              <strong>Health<span>Ops</span></strong>
              <small>Healthcare Operations Platform</small>
            </div>
          </div>

          <div className="login-heading">
            <h2>Welcome back <span>👋</span></h2>
            <p className="login-subtitle">
              Sign in to access your healthcare dashboard
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                id="forgotPassword"
                type="button"
                className="forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              id="loginSubmit"
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span className="button-arrow">→</span>}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <button
            id="createAccount"
            type="button"
            className="create-account-button"
            onClick={() => navigate("/register")}
          >
            <span className="create-account-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M15 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 5 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-5v6M14 8h6" /></svg>
            </span>
            Create account
          </button>

          <div className="secure-access">
            <span className="secure-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
            </span>
            <div>
              <strong>Secure &amp; encrypted</strong>
              <span>Your data is protected with industry-standard security</span>
            </div>
          </div>

          <div className="login-footer">
            <span>© 2026 <b>HealthOps</b>. All rights reserved.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;