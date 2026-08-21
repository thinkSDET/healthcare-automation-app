/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const resubmissionRequest =
    (location.state as {
      resubmission?: boolean;
      request?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        specialization?: string;
        licenseNumber?: string;
        experience?: number;
      };
    } | null) || null;

  const [form, setForm] = useState({
    firstName: resubmissionRequest?.request?.firstName || "",
    lastName: resubmissionRequest?.request?.lastName || "",
    email: resubmissionRequest?.request?.email || "",
    password: "",
    confirmPassword: "",

    role: resubmissionRequest?.resubmission ? "DOCTOR" : "PATIENT",

    // Patient profile fields
    dateOfBirth: "",
    gender: "MALE",
    phone: resubmissionRequest?.request?.phone || "",
    address: "",

    // Doctor registration fields
    specialization: resubmissionRequest?.request?.specialization || "",
    licenseNumber: resubmissionRequest?.request?.licenseNumber || "",
    experience: resubmissionRequest?.request?.experience?.toString() || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Client-side password validation
     */
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    /*
     * Patient-specific validation
     */
    if (form.role === "PATIENT") {
      if (
        !form.dateOfBirth ||
        !form.gender ||
        !form.phone
      ) {
        setError(
          "Date of birth, gender and phone are required for patients."
        );
        return;
      }
    }

    /*
     * Doctor-specific validation
     *
     * This only prepares a doctor registration request.
     * It does NOT create a Doctor record directly.
     */
    if (form.role === "DOCTOR") {
      if (
        !form.phone ||
        !form.specialization ||
        !form.licenseNumber ||
        !form.experience
      ) {
        setError(
          "Phone, specialization, license number and experience are required for doctors."
        );
        return;
      }

      const experience = Number(form.experience);

      if (
        !Number.isInteger(experience) ||
        experience < 0 ||
        experience > 60
      ) {
        setError(
          "Experience must be a whole number between 0 and 60."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            role: form.role,

            /*
             * Patient profile information
             */
            ...(form.role === "PATIENT" && {
              dateOfBirth: form.dateOfBirth,
              gender: form.gender,
              phone: form.phone,
              address: form.address,
            }),

            /*
             * Doctor registration request information
             */
            ...(form.role === "DOCTOR" && {
              phone: form.phone,
              specialization: form.specialization,
              licenseNumber: form.licenseNumber,
              experience: Number(form.experience),
            }),
          }),
        }
      );

      const result = await response.json();

      console.log(
        "Registration response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Registration failed."
        );
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container register-page">
      <section className="login-brand-panel">
        <div className="brand-top">
          <div className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="presentation">
              <path d="M19 5h10v12h12v10H29v16H19V27H7V17h12V5Z" />
            </svg>
          </div>

          <div>
            <h1>
              Health<span>Ops</span>
            </h1>
            <p>Healthcare Operations Platform</p>
          </div>
        </div>

        <div className="brand-message">
          <p className="brand-eyebrow">JOIN HEALTHOPS</p>

          <h2>
            One platform.<br />
            <span>Every healthcare workflow.</span>
          </h2>

          <p className="brand-description">
            Create your secure account and connect with the healthcare
            operations platform built for patients, doctors, and healthcare teams.
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

      <section className="login-content register-content">
        <div className="login-card register-card">
          <div className="mobile-brand">
            <div className="mobile-brand-logo" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path d="M19 5h10v12h12v10H29v16H19V27H7V17h12V5Z" />
              </svg>
            </div>

            <div>
              <strong>
                Health<span>Ops</span>
              </strong>
              <small>Healthcare Operations Platform</small>
            </div>
          </div>

          <div className="login-heading">
            <h2>
              {resubmissionRequest?.resubmission
                ? "Update your registration"
                : "Create your account"}
            </h2>

            <p className="login-subtitle">
              {resubmissionRequest?.resubmission
                ? "Review your rejected registration details and resubmit your application."
                : "Register to access the HealthOps healthcare management platform."}
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="register-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Account Type</label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={Boolean(resubmissionRequest?.resubmission)}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PHARMACIST">Pharmacist</option>
              </select>
            </div>

            {form.role === "PATIENT" && (
              <>
                <div className="register-grid">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {form.role === "DOCTOR" && (
              <>
                <div className="register-grid">
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="e.g. Cardiology"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      placeholder="e.g. 10"
                      min="0"
                      max="60"
                      value={form.experience}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    placeholder="Enter medical license number"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorPhone">Phone Number</label>
                  <input
                    id="doctorPhone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : resubmissionRequest?.resubmission
                ? "Resubmit Registration"
                : "Create Account"}
            </button>
          </form>

          <div className="register-footer">
            <span>Already have an account?</span>

            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/login")}
            >
              Sign in
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
              <span>
                Your information is protected with industry-standard security
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;