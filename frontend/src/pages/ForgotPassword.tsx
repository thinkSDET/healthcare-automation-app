import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to process request"
        );
      }

      setMessage(
        "If the email exists, password reset instructions have been generated."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">
          <div className="brand-icon">+</div>

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
            Forgot Password?
          </h2>

          <p className="login-subtitle">
            Enter your email address and
            we'll help you reset your
            password.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label>
                Email address
              </label>

              <input
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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Send Reset Instructions"}
            </button>

          </form>

          <div className="register-footer">

            <button
              type="button"
              className="link-button"
              onClick={() =>
                navigate("/login")
              }
            >
              ← Back to Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;