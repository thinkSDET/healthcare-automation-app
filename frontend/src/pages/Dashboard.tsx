import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
                  View your appointment history
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
              "Access your profile, appointments and pharmacy orders from your patient portal."}

            {isPharmacist &&
              "Look up prescriptions and orders by patient, order or prescription ID to update pharmacy status."}

          </p>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
