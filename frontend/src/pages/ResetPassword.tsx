/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Invalid or missing reset token."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Password reset failed"
        );
      }

      setSuccess(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <style>{`
        .reset-password-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 15% 20%, rgba(17, 148, 142, 0.12), transparent 30%),
            radial-gradient(circle at 85% 80%, rgba(24, 183, 176, 0.10), transparent 32%),
            #f4f8fb;
          color: #10233f;
        }

        .reset-shell {
          width: min(960px, 100%);
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          overflow: hidden;
          border: 1px solid #dce7ee;
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 24px 70px rgba(16, 35, 63, 0.14);
        }

        .reset-brand-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
          background: linear-gradient(145deg, #0f817b 0%, #08736d 100%);
          color: #ffffff;
        }

        .reset-brand-panel::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -90px;
          bottom: -90px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .reset-brand-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 26px;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.22);
          font-size: 30px;
          font-weight: 700;
        }

        .reset-brand-panel h1 {
          margin: 0 0 12px;
          font-size: 31px;
          line-height: 1.15;
          color: #ffffff;
        }

        .reset-brand-panel > p {
          margin: 0;
          max-width: 310px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.65;
          font-size: 14px;
        }

        .reset-security-note {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 42px;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.10);
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
        }

        .reset-form-panel {
          padding: 52px 58px;
          display: flex;
          align-items: center;
        }

        .reset-form-content {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .reset-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 14px;
          background: #e7f6f4;
          color: #0b817a;
        }

        .reset-form-content h2 {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.2;
          color: #10233f;
        }

        .reset-subtitle {
          margin: 0 0 28px;
          color: #6b7b91;
          font-size: 14px;
          line-height: 1.55;
        }

        .reset-field {
          margin-bottom: 20px;
        }

        .reset-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #243852;
        }

        .reset-input-wrap {
          position: relative;
        }

        .reset-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #7b8da3;
          pointer-events: none;
        }

        .reset-field input {
          width: 100%;
          height: 50px;
          box-sizing: border-box;
          padding: 0 15px 0 45px;
          border: 1px solid #cbd8e4;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #10233f;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .reset-field input:focus {
          border-color: #0b938c;
          box-shadow: 0 0 0 3px rgba(11, 147, 140, 0.12);
        }

        .reset-field input::placeholder {
          color: #9aa9ba;
        }

        .reset-button {
          width: 100%;
          height: 50px;
          margin-top: 6px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, #0b8b84, #10aaa2);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(11, 139, 132, 0.20);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }

        .reset-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 13px 26px rgba(11, 139, 132, 0.25);
        }

        .reset-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .reset-message {
          margin-bottom: 20px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.45;
        }

        .reset-error {
          border: 1px solid #f0c8c8;
          background: #fff5f5;
          color: #a52d2d;
        }

        .reset-success {
          border: 1px solid #bce4d7;
          background: #f1fbf7;
          color: #167053;
        }

        @media (max-width: 760px) {
          .reset-password-page {
            padding: 20px 14px;
          }

          .reset-shell {
            grid-template-columns: 1fr;
            border-radius: 22px;
          }

          .reset-brand-panel {
            padding: 32px;
          }

          .reset-brand-panel > p,
          .reset-security-note {
            display: none;
          }

          .reset-brand-panel h1 {
            font-size: 25px;
          }

          .reset-brand-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 18px;
          }

          .reset-form-panel {
            padding: 34px 28px 40px;
          }
        }
      `}</style>

      <div className="reset-shell">
        <section className="reset-brand-panel">
          <div className="reset-brand-icon">+</div>

          <h1>Healthcare Automation</h1>

          <p>
            Secure healthcare management with protected access
            and reliable account recovery.
          </p>

          <div className="reset-security-note">
            <span aria-hidden="true">🔒</span>
            <span>Your new password will be securely protected.</span>
          </div>
        </section>

        <section className="reset-form-panel">
          <div className="reset-form-content">
            <div className="reset-icon" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
            </div>

            <h2>Reset Password</h2>

            <p className="reset-subtitle">
              Create a new password for your account.
            </p>

            {error && (
              <div className="reset-message reset-error">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-message reset-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="reset-field">
                <label htmlFor="new-password">New Password</label>

                <div className="reset-input-wrap">
                  <span className="reset-input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="new-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="reset-field">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="reset-input-wrap">
                  <span className="reset-input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="reset-button"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPassword;