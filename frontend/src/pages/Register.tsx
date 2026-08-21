/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    role: "PATIENT",

    // Patient profile fields
    dateOfBirth: "",
    gender: "MALE",
    phone: "",
    address: "",

    // Doctor registration fields
    specialization: "",
    licenseNumber: "",
    experience: "",
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
    <div className="login-page">
      <div className="login-container">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="login-brand">
          <div className="brand-icon">+</div>

          <h1>
            Healthcare Automation
          </h1>

          <p>
            Secure Healthcare Management Platform
          </p>
        </div>

        {/* =================================================
            REGISTRATION CARD
        ================================================= */}

        <div className="login-card register-card">

          <h2>Create your account</h2>

          <p className="login-subtitle">
            Register to access the healthcare
            management portal
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div className="register-grid">

              <div className="form-group">
                <label htmlFor="firstName">
                  First Name
                </label>

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
                <label htmlFor="lastName">
                  Last Name
                </label>

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

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

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

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="register-grid">

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

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
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

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

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="role">
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="PATIENT">
                  Patient
                </option>

                <option value="DOCTOR">
                  Doctor
                </option>

                <option value="PHARMACIST">
                  Pharmacist
                </option>
              </select>

            </div>

            {/* =================================================
                PATIENT PROFILE
            ================================================= */}

            {form.role === "PATIENT" && (
              <>
                <div className="register-grid">

                  {/* DATE OF BIRTH */}

                  <div className="form-group">

                    <label htmlFor="dateOfBirth">
                      Date of Birth
                    </label>

                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* GENDER */}

                  <div className="form-group">

                    <label htmlFor="gender">
                      Gender
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="MALE">
                        Male
                      </option>

                      <option value="FEMALE">
                        Female
                      </option>

                      <option value="OTHER">
                        Other
                      </option>
                    </select>

                  </div>

                </div>

                {/* PHONE */}

                <div className="form-group">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

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

                {/* ADDRESS */}

                <div className="form-group">

                  <label htmlFor="address">
                    Address
                  </label>

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

            {/* =================================================
                DOCTOR REGISTRATION
            ================================================= */}

            {form.role === "DOCTOR" && (
              <>
                <div className="register-grid">

                  {/* SPECIALIZATION */}

                  <div className="form-group">

                    <label htmlFor="specialization">
                      Specialization
                    </label>

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

                  {/* EXPERIENCE */}

                  <div className="form-group">

                    <label htmlFor="experience">
                      Experience (Years)
                    </label>

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

                {/* LICENSE NUMBER */}

                <div className="form-group">

                  <label htmlFor="licenseNumber">
                    License Number
                  </label>

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

                {/* PHONE */}

                <div className="form-group">

                  <label htmlFor="doctorPhone">
                    Phone Number
                  </label>

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

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="register-footer">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              className="link-button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;