import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Appointment {
  id: number;
  appointmentNo: string;
  appointmentAt: string;
  duration: number;
  type: string;
  status: string;
  reason: string;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

function MyAppointments() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const patientId = user?.patientId;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setLoading(false);
        setError(
          "No patient record is linked to this account."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:4000/api/patients/${patientId}/appointments`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to load appointments"
          );
        }

        setAppointments(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [patientId]);

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Appointments</h1>
          <p>View your appointment history. Booking is not available.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          {error && (
            <div className="auth-error" style={{ margin: "20px 30px 0" }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">No appointments found.</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Appointment</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <strong>{appointment.appointmentNo}</strong>
                      </td>
                      <td>
                        {appointment.doctor
                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "—"}
                        {appointment.doctor && (
                          <small>
                            {appointment.doctor.specialization}
                          </small>
                        )}
                      </td>
                      <td>
                        {new Date(
                          appointment.appointmentAt
                        ).toLocaleString()}
                      </td>
                      <td>{appointment.type}</td>
                      <td>
                        <span className="status-badge">
                          {appointment.status}
                        </span>
                      </td>
                      <td>{appointment.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyAppointments;
