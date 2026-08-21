/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [rejectedRequest, setRejectedRequest] = useState<any>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const role =
    user?.role?.toUpperCase();

  const isAdmin =
    role === "ADMIN";

  const isDoctor =
    role === "DOCTOR";

  const isPatient =
    role === "PATIENT";

  const isPharmacist =
    role === "PHARMACIST";

  const canViewAudit =
    role === "ADMIN" ||
    role === "VIEWER" ||
    role === "SUPPORT";

  useEffect(() => {
    if (!isDoctor || !token) {
      return;
    }

    const loadRegistrationStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/doctors/registration-requests/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        if (
          result.success &&
          result.data?.status === "REJECTED"
        ) {
          setRejectedRequest(result.data);
          setShowRejectionModal(true);
        }
      } catch (error) {
        console.error(
          "Failed to load doctor registration status:",
          error
        );
      }
    };

    loadRegistrationStatus();
  }, [isDoctor, token]);


  return (
    <div className="dashboard-page">

      <section className="dashboard-welcome-banner">
        <h1>
          Healthcare Dashboard
        </h1>

        <p>
          Welcome{" "}
          {user?.firstName || ""}{" "}
          {user?.lastName || ""}!
        </p>
      </section>

      {showRejectionModal && rejectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(15, 23, 42, 0.62)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "8px" }}>⚠️</div>

            <h2 style={{ margin: "0 0 8px" }}>
              Registration Update Required
            </h2>

            <p style={{ margin: "0 0 18px", lineHeight: 1.6 }}>
              Your doctor registration was not approved by the Admin.
              Please review the reason below and update your information.
            </p>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                marginBottom: "22px",
              }}
            >
              <strong>Admin's reason</strong>
              <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>
                {rejectedRequest.rejectionReason ||
                  "No rejection reason was provided. Please review your registration details."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate("/register", {
                    state: {
                      resubmission: true,
                      request: rejectedRequest,
                    },
                  })
                }
              >
                Update & Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="dashboard-content">

        <div className="dashboard-grid">

          {(isAdmin || isDoctor) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/patients")
              }
            >
              <div className="card-icon">
                👤
              </div>

              <div>
                <h3>
                  Patients
                </h3>

                <p>
                  {isAdmin
                    ? "Manage patient records"
                    : "View patient records"}
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isDoctor) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/doctors")
              }
            >
              <div className="card-icon">
                🩺
              </div>

              <div>
                <h3>
                  Doctors
                </h3>

                <p>
                  {isAdmin
                    ? "Manage healthcare providers"
                    : "View healthcare providers"}
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isDoctor) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/appointments")
              }
            >
              <div className="card-icon">
                📅
              </div>

              <div>
                <h3>
                  Appointments
                </h3>

                <p>
                  {isAdmin
                    ? "Schedule and manage appointments"
                    : "View patient appointments"}
                </p>
              </div>
            </div>
          )}

          {isPatient && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/my/profile")
              }
            >
              <div className="card-icon">
                👤
              </div>

              <div>
                <h3>
                  My Profile
                </h3>

                <p>
                  View your patient information
                </p>
              </div>
            </div>
          )}

          {isPatient && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/my/appointments")
              }
            >
              <div className="card-icon">
                📅
              </div>

              <div>
                <h3>
                  My Appointments
                </h3>

                <p>
                  View appointments and request visits for staff approval
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isDoctor) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/appointment-requests")
              }
            >
              <div className="card-icon">
                🗓️
              </div>

              <div>
                <h3>
                  Appointment Requests
                </h3>

                <p>
                  Review and approve patient appointment requests
                </p>
              </div>
            </div>
          )}

          {isPatient && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/my/prescriptions")
              }
            >
              <div className="card-icon">
                💊
              </div>

              <div>
                <h3>
                  My Prescriptions
                </h3>

                <p>
                  View prescriptions and request refill or renewal
                </p>
              </div>
            </div>
          )}

          {isPatient && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/my/orders")
              }
            >
              <div className="card-icon">
                📦
              </div>

              <div>
                <h3>
                  My Orders
                </h3>

                <p>
                  View and create your orders
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isDoctor) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/refill-requests")
              }
            >
              <div className="card-icon">
                🔁
              </div>

              <div>
                <h3>
                  Refill Requests
                </h3>

                <p>
                  Review refill and renewal requests
                </p>
              </div>
            </div>
          )}

          {isPharmacist && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/pharmacy")
              }
            >
              <div className="card-icon">
                💊
              </div>

              <div>
                <h3>
                  Pharmacy Workspace
                </h3>

                <p>
                  Manage prescriptions and orders
                </p>
              </div>
            </div>
          )}

          {isPharmacist && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/refill-requests")
              }
            >
              <div className="card-icon">
                🔁
              </div>

              <div>
                <h3>
                  Refill Queue
                </h3>

                <p>
                  Approve or reject refill requests
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isPharmacist) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/inventory")
              }
            >
              <div className="card-icon">
                📦
              </div>

              <div>
                <h3>
                  Inventory
                </h3>

                <p>
                  Medication stock levels and adjustments
                </p>
              </div>
            </div>
          )}

          {(isAdmin || isPharmacist) && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/replenishment-requests")
              }
            >
              <div className="card-icon">
                📥
              </div>

              <div>
                <h3>
                  Replenishment
                </h3>

                <p>
                  Request, approve, and receive stock
                </p>
              </div>
            </div>
          )}

          {canViewAudit && (
            <div
              className="dashboard-card"
              onClick={() =>
                navigate("/audit-logs")
              }
            >
              <div className="card-icon">
                📋
              </div>

              <div>
                <h3>
                  Audit Logs
                </h3>

                <p>
                  Review clinical and operational mutation trail
                </p>
              </div>
            </div>
          )}

        </div>

        <section className="dashboard-welcome">

          <h2>
            Healthcare Operations
          </h2>

          <p>
            {isAdmin &&
              "Manage patients, doctors, appointments and healthcare workflows from one centralized platform."}

            {isDoctor &&
              "View patients, provider directory and appointments. Clinical prescription tools are available from patient records."}

            {isPatient &&
              "Access your profile, appointments, prescriptions and pharmacy orders from your patient portal."}

            {isPharmacist &&
              "Look up prescriptions and orders, and review refill requests in the refill queue."}

            {(role === "VIEWER" || role === "SUPPORT") &&
              "Review the operational audit trail for important clinical and business changes."}

          </p>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;