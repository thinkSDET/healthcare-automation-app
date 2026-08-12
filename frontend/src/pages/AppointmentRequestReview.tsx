import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AppointmentRequest {
  id: number;
  requestNo: string;
  patientId: number;
  doctorId: number;
  requestedAt: string;
  duration: number;
  type: string;
  reason: string;
  status: string;
  notes?: string | null;
  rejectionReason?: string | null;
  appointmentId?: number | null;
  patient?: {
    firstName: string;
    lastName: string;
    medicalId: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointment?: {
    id: number;
    appointmentNo: string;
    status: string;
  } | null;
}

function AppointmentRequestReview() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectReasons, setRejectReasons] = useState<
    Record<number, string>
  >({});

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const query =
        statusFilter && statusFilter !== "ALL"
          ? `?status=${statusFilter}`
          : "";

      const response = await fetch(
        `http://localhost:4000/api/appointment-requests${query}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load appointment requests"
        );
      }

      setRequests(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointment requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const updateStatus = async (
    request: AppointmentRequest,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setBusyId(request.id);
      setError("");
      setSuccess("");

      const body: { status: string; rejectionReason?: string } = {
        status,
      };

      if (status === "REJECTED") {
        const reason = (rejectReasons[request.id] || "").trim();
        if (!reason) {
          setError("Rejection reason is required.");
          setBusyId(null);
          return;
        }
        body.rejectionReason = reason;
      }

      const response = await fetch(
        `http://localhost:4000/api/appointment-requests/${request.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update request"
        );
      }

      setSuccess(
        status === "APPROVED"
          ? `Approved ${request.requestNo}. Appointment ${result.data.appointment?.appointmentNo || ""} created.`
          : `Rejected ${request.requestNo}.`
      );
      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update request"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Appointment Requests</h1>
          <p>
            Approve creates a SCHEDULED appointment using existing conflict
            checks. Reject requires a reason.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/appointments")}
        >
          ← Appointments
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          <div className="form-group">
            <label>Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="ALL">ALL</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{ color: "#0f766e", fontWeight: 600 }}>
              {success}
            </div>
          )}

          {loading ? (
            <p>Loading…</p>
          ) : requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>When</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.requestNo}</strong>
                    </td>
                    <td>
                      {request.patient
                        ? `${request.patient.firstName} ${request.patient.lastName}`
                        : request.patientId}
                    </td>
                    <td>
                      {request.doctor
                        ? `Dr. ${request.doctor.firstName} ${request.doctor.lastName}`
                        : request.doctorId}
                    </td>
                    <td>
                      {new Date(request.requestedAt).toLocaleString()}
                      <br />
                      <small>
                        {request.duration} min · {request.type}
                      </small>
                    </td>
                    <td>{request.reason}</td>
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            minWidth: "220px",
                          }}
                        >
                          <button
                            className="primary-button"
                            disabled={busyId === request.id}
                            onClick={() =>
                              updateStatus(request, "APPROVED")
                            }
                          >
                            Approve
                          </button>
                          <input
                            placeholder="Rejection reason"
                            value={rejectReasons[request.id] || ""}
                            onChange={(e) =>
                              setRejectReasons((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="secondary-button"
                            disabled={busyId === request.id}
                            onClick={() =>
                              updateStatus(request, "REJECTED")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default AppointmentRequestReview;
