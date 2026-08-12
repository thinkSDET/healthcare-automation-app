import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Doctor {
  id: number;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  status?: string;
}

function RequestAppointment() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [requestedAt, setRequestedAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [type, setType] = useState("IN_PERSON");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:4000/api/doctors",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load doctors"
          );
        }

        setDoctors(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load doctors"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorId || !requestedAt || reason.trim().length < 3) {
      setError(
        "Doctor, requested date/time, and reason (min 3 characters) are required."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const isoRequestedAt = new Date(requestedAt).toISOString();

      const response = await fetch(
        "http://localhost:4000/api/appointment-requests",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: Number(doctorId),
            requestedAt: isoRequestedAt,
            duration: Number(duration),
            type,
            reason: reason.trim(),
            notes: notes.trim() || undefined,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit request"
        );
      }

      setSuccess(
        `Request ${result.data.requestNo} submitted. Staff will review it.`
      );
      setTimeout(() => navigate("/my/appointments"), 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Request Appointment</h1>
          <p>
            Submit a preferred doctor, date, and reason. Staff must approve
            before an appointment is created.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/my/appointments")}
        >
          ← Back
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{ color: "#0f766e", fontWeight: 600 }}>
              {success}
            </div>
          )}

          {loading ? (
            <p>Loading doctors…</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} —{" "}
                      {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Preferred date & time</label>
                <input
                  type="datetime-local"
                  value={requestedAt}
                  onChange={(e) => setRequestedAt(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="IN_PERSON">IN_PERSON</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="PHONE">PHONE</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default RequestAppointment;
