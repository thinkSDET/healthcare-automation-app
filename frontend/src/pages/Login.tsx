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

      <div className="login-brand">

        <div className="brand-icon">
          +
        </div>

        <h1>
          Healthcare Automation
        </h1>

        <p>
          Secure Healthcare Management
          Platform
        </p>

      </div>

      <div className="login-card">

        <h2>
          Welcome back
        </h2>

        <p className="login-subtitle">
          Sign in to access your
          healthcare dashboard
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* Remember Me + Forgot Password */}

          <div className="login-options">

            <label className="remember-me">

              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              id="forgotPassword"
              type="button"
              className="forgot-link"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
            >
              Forgot password?
            </button>

          </div>

          {/* Login */}

          <button
            id="loginSubmit"
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        {/* Registration */}

        <div className="register-footer">

          <span>
            Don't have an account?
          </span>

          <button
            id="createAccount"
            type="button"
            className="link-button"
            onClick={() =>
              navigate("/register")
            }
          >
            Create account
          </button>

        </div>

        {/* Footer */}

        <div className="login-footer">

          <span>
            Secure access to your
            healthcare services
          </span>

        </div>

      </div>

    </div>
  );
}

export default Login;