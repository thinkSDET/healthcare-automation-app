/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
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

  const [resetToken, setResetToken] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setResetToken("");

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

      /*
       * Local/dev only: backend may include
       * resetToken so QA can complete the flow
       * without an email service.
       */
      if (
        typeof result.resetToken ===
        "string"
      ) {
        setResetToken(result.resetToken);
      }
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
    <div className="login-container forgot-password-page">
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
          <p className="brand-eyebrow">SECURITY, SIMPLIFIED</p>

          <h2>
            Get back<br />
            <span>to your care.</span>
          </h2>

          <p className="brand-description">
            Reset your password securely and get back to managing your
            healthcare journey with HealthOps.
          </p>
        </div>

        <div className="healthcare-modules" aria-hidden="true">
          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24">
                <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm3 11v-1.5a3.5 3.5 0 0 0-3.5-3.5H16" />
              </svg>
            </div>
            <span>Patients</span>
          </div>

          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24">
                <path d="M8 3v5a4 4 0 0 0 8 0V3M5 3h6M13 3h6M12 12v9M8 21h8" />
              </svg>
            </div>
            <span>Doctors</span>
          </div>

          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3" />
              </svg>
            </div>
            <span>Appointments</span>
          </div>

          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 3h6M10 3v5l-5 10a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18L14 8V3M7 16h10" />
              </svg>
            </div>
            <span>Labs</span>
          </div>

          <div className="healthcare-module">
            <div className="module-icon">
              <svg viewBox="0 0 24 24">
                <path d="m8.5 7.5 3-3a3.5 3.5 0 0 1 5 5l-2 2M15.5 16.5l-3 3a3.5 3.5 0 0 1-5-5l2-2M9 15l6-6" />
              </svg>
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

      <section className="login-content forgot-password-content">
        <div className="login-card forgot-password-card">
          <div className="mobile-brand">
            <div className="mobile-brand-logo" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path d="M19 5h10v12h12v10H29v16H19V27H7V17h12V5Z" />
              </svg>
            </div>

            <div>
              <strong>Health<span>Ops</span></strong>
              <small>Healthcare Operations Platform</small>
            </div>
          </div>

          <div className="forgot-password-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <rect x="7" y="17" width="34" height="24" rx="6" />
              <path d="M15 17v-5a9 9 0 0 1 18 0v5" />
              <circle cx="24" cy="29" r="2.2" />
              <path d="M24 31.5V36" />
            </svg>
          </div>

          <div className="login-heading">
            <h2>Forgot your password?</h2>

            <p className="login-subtitle">
              No worries. Enter your registered email address and we'll help
              you securely reset your password.
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success" role="status">
              {message}
            </div>
          )}

          {resetToken && (
            <div className="reset-token-panel">
              <div className="reset-token-header">
                <span className="reset-token-check">✓</span>
                <div>
                  <strong>Reset request created</strong>
                  <span>Development mode</span>
                </div>
              </div>

              <p>
                Use the button below to continue to the password reset page.
              </p>

              <button
                type="button"
                className="login-button reset-token-button"
                onClick={() =>
                  navigate(
                    `/reset-password?token=${encodeURIComponent(resetToken)}`
                  )
                }
              >
                Continue to Reset Password
                <span className="button-arrow">→</span>
              </button>
            </div>
          )}

          {!resetToken && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="forgotPasswordEmail">Email address</label>

                <div className="input-shell">
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>

                  <input
                    id="forgotPasswordEmail"
                    name="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : "Send Reset Instructions"}
                {!loading && <span className="button-arrow">→</span>}
              </button>
            </form>
          )}

          <div className="forgot-password-help">
            <span className="help-icon" aria-hidden="true">i</span>
            <span>
              For your security, we won't reveal whether an email address is
              registered with HealthOps.
            </span>
          </div>

          <div className="register-footer">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </button>
          </div>

          <div className="secure-access">
            <span className="secure-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>

            <div>
              <strong>Secure &amp; encrypted</strong>
              <span>Your information is protected with industry-standard security</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;