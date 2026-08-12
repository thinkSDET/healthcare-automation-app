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

interface AppointmentRequest {
  id: number;
  requestNo: string;
  requestedAt: string;
  duration: number;
  type: string;
  reason: string;
  status: string;
  rejectionReason?: string | null;
  appointment?: {
    appointmentNo: string;
    status: string;
  } | null;
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
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadData = async () => {
    if (!patientId) {
      setLoading(false);
      setError("No patient record is linked to this account.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${getToken()}`,
      };

      const [apptRes, reqRes] = await Promise.all([
        fetch(
          `http://localhost:4000/api/patients/${patientId}/appointments`,
          { headers }
        ),
        fetch("http://localhost:4000/api/appointment-requests", {
          headers,
        }),
      ]);

      const apptResult = await apptRes.json();
      const reqResult = await reqRes.json();

      if (!apptRes.ok || !apptResult.success) {
        throw new Error(
          apptResult.message || "Failed to load appointments"
        );
      }
      if (!reqRes.ok || !reqResult.success) {
        throw new Error(
          reqResult.message || "Failed to load appointment requests"
        );
      }

      setAppointments(apptResult.data || []);
      setRequests(reqResult.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const cancelRequest = async (requestId: number) => {
    try {
      setBusyId(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/appointment-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to cancel request"
        );
      }

      setSuccess("Request cancelled.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel request"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Appointments</h1>
          <p>
            View scheduled appointments and your appointment requests.
            Requested visits require staff approval before they become
            appointments.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-button"
            onClick={() => navigate("/my/appointments/request")}
          >
            Request appointment
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          {error && (
            <div className="auth-error" style={{ margin: "20px 30px 0" }}>
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                margin: "20px 30px 0",
                color: "#0f766e",
                fontWeight: 600,
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : (
            <>
              <section style={{ padding: "20px 30px" }}>
                <h2>Scheduled appointments</h2>
                {appointments.length === 0 ? (
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
                              <strong>
                                {appointment.appointmentNo}
                              </strong>
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
              </section>

              <section style={{ padding: "20px 30px" }}>
                <h2>My appointment requests</h2>
                {requests.length === 0 ? (
                  <p>No requests yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Request</th>
                          <th>Doctor</th>
                          <th>Preferred time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <strong>{request.requestNo}</strong>
                              <br />
                              <small>{request.reason}</small>
                            </td>
                            <td>
                              {request.doctor
                                ? `Dr. ${request.doctor.firstName} ${request.doctor.lastName}`
                                : "—"}
                            </td>
                            <td>
                              {new Date(
                                request.requestedAt
                              ).toLocaleString()}
                            </td>
                            <td>
                              {request.status}
                              {request.rejectionReason
                                ? ` — ${request.rejectionReason}`
                                : ""}
                              {request.appointment?.appointmentNo
                                ? ` → ${request.appointment.appointmentNo}`
                                : ""}
                            </td>
                            <td>
                              {request.status === "SUBMITTED" && (
                                <button
                                  className="secondary-button"
                                  disabled={busyId === request.id}
                                  onClick={() =>
                                    cancelRequest(request.id)
                                  }
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyAppointments;
