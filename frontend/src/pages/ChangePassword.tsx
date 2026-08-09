import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ChangePassword() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

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

    /*
     * Make sure the user is authenticated.
     */
    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );

      return;
    }

    /*
     * Password validation
     */
    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );

      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setError(
        "New password must be different from current password."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/auth/change-password",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result =
        await response.json();

      /*
       * Handle expired/invalid token.
       */
      if (response.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );

        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to change password"
        );
      }

      /*
       * Password changed successfully.
       */
      setSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to change password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      {/* Header */}

      <header className="patients-header">

        <div>

          <h1>
            Change Password
          </h1>

          <p>
            Update your account password.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back
        </button>

      </header>

      {/* Content */}

      <main className="patients-content">

        <div className="auth-form-card">

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            {/* Current Password */}

            <div className="form-group">

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* New Password */}

            <div className="form-group">

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
              />

            </div>

            {/* Confirm Password */}

            <div className="form-group">

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
              />

            </div>

            {/* Submit */}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Change Password"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default ChangePassword;