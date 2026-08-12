/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Appointment {
  id: number;
  appointmentNo: string;
  patientId: number;
  doctorId: number;
  appointmentAt: string;
  duration: number;
  type: string;
  status: string;
  reason: string;
  notes: string | null;

  patient?: {
    id: number;
    medicalId: string;
    firstName: string;
    lastName: string;
  };

  doctor?: {
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

type StatusAction = {
  label: string;
  nextStatus: string;
  adminOnly?: boolean;
};

const STATUS_ACTIONS: Record<string, StatusAction[]> = {
  SCHEDULED: [
    { label: "Confirm", nextStatus: "CONFIRMED" },
    { label: "Mark No-show", nextStatus: "NO_SHOW" },
  ],
  CONFIRMED: [
    { label: "Check in", nextStatus: "CHECKED_IN" },
  ],
  CHECKED_IN: [
    { label: "Start consultation", nextStatus: "IN_CONSULTATION" },
  ],
  IN_CONSULTATION: [
    { label: "Complete", nextStatus: "COMPLETED" },
  ],
};

const toDatetimeLocalValue = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const role = user?.role?.toUpperCase() ?? "";
  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const canAdvance = isAdmin || isDoctor;

  const [appointment, setAppointment] = useState<Appointment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [appointmentAt, setAppointmentAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [type, setType] = useState("IN_PERSON");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const syncForm = (data: Appointment) => {
    setAppointmentAt(toDatetimeLocalValue(data.appointmentAt));
    setDuration(String(data.duration ?? 30));
    setType(data.type || "IN_PERSON");
    setReason(data.reason || "");
    setNotes(data.notes || "");
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:4000/api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load appointment"
        );
      }

      setAppointment(result.data);
      syncForm(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointment"
      );
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const status = (appointment?.status || "").toUpperCase();
  const canEditSchedule =
    isAdmin && (status === "SCHEDULED" || status === "CONFIRMED");
  const canCancel = isAdmin && status === "SCHEDULED";
  const availableActions = STATUS_ACTIONS[status] ?? [];

  const handleStatusChange = async (nextStatus: string) => {
    if (!appointment) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointment.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update appointment status"
        );
      }

      setAppointment(result.data);
      syncForm(result.data);
      setSuccess(`Status updated to ${nextStatus}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update appointment status"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment || !canEditSchedule) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointment.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentAt: new Date(appointmentAt).toISOString(),
            duration: Number(duration),
            type,
            reason,
            notes: notes || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update appointment"
        );
      }

      setAppointment(result.data);
      syncForm(result.data);
      setSuccess("Appointment details saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update appointment"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment || !canCancel) {
      return;
    }

    const appointmentLabel =
      appointment.appointmentNo || `appointment #${appointment.id}`;

    const confirmed = window.confirm(
      `Are you sure you want to cancel ${appointmentLabel}?\n\n` +
        "This will cancel the appointment and cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to cancel appointment"
        );
      }

      setAppointment(result.data);
      syncForm(result.data);
      setSuccess("Appointment cancelled.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel appointment"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">Loading appointment...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="page">
        <header className="patients-header">
          <div>
            <h1>Appointment</h1>
            <p>{error || "Appointment not found."}</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => navigate("/appointments")}
          >
            ← Back to Appointments
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="patients-header">
        <div>
          <h1>{appointment.appointmentNo}</h1>
          <p>Appointment details and lifecycle actions.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/appointments")}
          disabled={saving}
        >
          ← Back to Appointments
        </button>
      </header>

      <main className="patients-content">
        {error && (
          <div className="error-message" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {success && (
          <div
            className="success-message"
            style={{ marginBottom: 16 }}
          >
            {success}
          </div>
        )}

        <div className="patients-card" style={{ marginBottom: 20 }}>
          <div className="table-header">
            <h2>Summary</h2>
            <span className="status-badge">{appointment.status}</span>
          </div>

          <div className="form-grid" style={{ padding: "0 24px 24px" }}>
            <div className="form-group">
              <label>Patient</label>
              <p>
                {appointment.patient
                  ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                  : `Patient #${appointment.patientId}`}
              </p>
              {appointment.patient && (
                <small>{appointment.patient.medicalId}</small>
              )}
            </div>

            <div className="form-group">
              <label>Doctor</label>
              <p>
                {appointment.doctor
                  ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                  : `Doctor #${appointment.doctorId}`}
              </p>
              {appointment.doctor && (
                <small>{appointment.doctor.specialization}</small>
              )}
            </div>

            <div className="form-group">
              <label>Date & Time</label>
              <p>
                {new Date(appointment.appointmentAt).toLocaleString()}
              </p>
            </div>

            <div className="form-group">
              <label>Type / Duration</label>
              <p>
                {appointment.type} · {appointment.duration} mins
              </p>
            </div>

            <div className="form-group">
              <label>Reason</label>
              <p>{appointment.reason}</p>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <p>{appointment.notes || "—"}</p>
            </div>
          </div>
        </div>

        {canAdvance && availableActions.length > 0 && (
          <div className="patients-card" style={{ marginBottom: 20 }}>
            <div className="table-header">
              <h2>Lifecycle actions</h2>
            </div>
            <div
              className="form-actions"
              style={{ padding: "0 24px 24px", justifyContent: "flex-start" }}
            >
              {availableActions.map((action) => (
                <button
                  key={action.nextStatus}
                  type="button"
                  className="primary-button"
                  disabled={saving}
                  onClick={() =>
                    handleStatusChange(action.nextStatus)
                  }
                >
                  {action.label}
                </button>
              ))}

              {canCancel && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  Cancel appointment
                </button>
              )}
            </div>
          </div>
        )}

        {canCancel && availableActions.length === 0 && (
          <div className="patients-card" style={{ marginBottom: 20 }}>
            <div className="table-header">
              <h2>Lifecycle actions</h2>
            </div>
            <div
              className="form-actions"
              style={{ padding: "0 24px 24px", justifyContent: "flex-start" }}
            >
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={handleCancel}
              >
                Cancel appointment
              </button>
            </div>
          </div>
        )}

        {canEditSchedule && (
          <div className="appointment-form-card">
            <div className="appointment-form-header">
              <div>
                <h2>Edit schedule & details</h2>
                <p>
                  Admin can update schedule while the appointment is
                  SCHEDULED or CONFIRMED.
                </p>
              </div>
            </div>

            <form
              className="appointment-form"
              onSubmit={handleSaveSchedule}
            >
              <div className="form-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="appointmentAt">Date & Time</label>
                    <input
                      id="appointmentAt"
                      type="datetime-local"
                      value={appointmentAt}
                      onChange={(e) =>
                        setAppointmentAt(e.target.value)
                      }
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration</label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={saving}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Appointment Type</label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={saving}
                    >
                      <option value="IN_PERSON">In Person</option>
                      <option value="VIDEO">Video Consultation</option>
                      <option value="PHONE">Phone Consultation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason for Visit</label>
                    <input
                      id="reason"
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default AppointmentDetails;
