import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Healthcare Dashboard</h1>
          <p>
            Welcome back to your healthcare management portal.
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

          <div
            className="dashboard-card"
            onClick={() => navigate("/patients")}
          >
            <div className="card-icon">👤</div>

            <div>
              <h3>Patients</h3>
              <p>Manage patient records</p>
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/doctors")}
          >
            <div className="card-icon">🩺</div>

            <div>
              <h3>Doctors</h3>
              <p>Manage healthcare providers</p>
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/appointments")}
          >
            <div className="card-icon">📅</div>

            <div>
              <h3>Appointments</h3>
              <p>Schedule and manage appointments</p>
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/prescriptions")}
          >
            <div className="card-icon">💊</div>

            <div>
              <h3>Prescriptions</h3>
              <p>Manage prescriptions</p>
            </div>
          </div>

        </div>

        <section className="dashboard-welcome">
          <h2>Healthcare Operations</h2>

          <p>
            Manage patients, doctors, appointments and healthcare
            workflows from one centralized platform.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;