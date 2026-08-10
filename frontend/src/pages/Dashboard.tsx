import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role =
    user?.role?.toUpperCase();

  const isAdmin =
    role === "ADMIN";

  const isDoctor =
    role === "DOCTOR";

  const isPatient =
    role === "PATIENT";

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div>
          <h1>
            Healthcare Dashboard
          </h1>

          <p>
            Welcome{" "}
            {user?.firstName || ""}{" "}
            {user?.lastName || ""}!
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

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
                  Manage patient records
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
                  Manage healthcare providers
                </p>
              </div>
            </div>
          )}

          {(isAdmin ||
            isDoctor ||
            isPatient) && (
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
                  Schedule and manage appointments
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
              "Manage patients, doctors and appointments from one centralized platform."}

            {isPatient &&
              "View your healthcare appointments and available services."}

            {role === "PHARMACIST" &&
              "Access your available pharmacy workflows."}
          </p>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;