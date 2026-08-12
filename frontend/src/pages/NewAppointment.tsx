/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../context/AuthContext";

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
}

interface Doctor {
  id: number;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  status?: string;
}

interface ExistingAppointment {
  id: number;
  doctorId: number;
  appointmentAt: string;
  duration: number;
  status: string;
}

function NewAppointment() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [appointments, setAppointments] =
    useState<ExistingAppointment[]>([]);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [type, setType] = useState("IN_PERSON");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setError("");

      const token = getAuthToken();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        patientsResponse,
        doctorsResponse,
        appointmentsResponse,
      ] = await Promise.all([
        fetch("http://localhost:4000/api/patients", { headers }),
        fetch("http://localhost:4000/api/doctors", { headers }),
        fetch("http://localhost:4000/api/appointments", { headers }),
      ]);

      const patientsResult = await patientsResponse.json();
      const doctorsResult = await doctorsResponse.json();
      const appointmentsResult = await appointmentsResponse.json();

      if (patientsResponse.ok && patientsResult.success) {
        setPatients(patientsResult.data);
      }

      if (doctorsResponse.ok && doctorsResult.success) {
        setDoctors(doctorsResult.data);
      }

      if (appointmentsResponse.ok && appointmentsResult.success) {
        setAppointments(appointmentsResult.data);
      }

      if (
        !patientsResponse.ok ||
        !doctorsResponse.ok ||
        !appointmentsResponse.ok
      ) {
        setError("Unable to load patients and doctors.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load patients and doctors.");
    } finally {
      setLoadingData(false);
    }
  };

  const getDoctorAvailability = (selectedDoctorId: number) => {
    const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
      day,
      startTime: "09:00",
      endTime: "17:00",
    }));

    const raw = localStorage.getItem("doctorAvailability");

    if (!raw) {
      return defaultSlots;
    }

    try {
      const saved = JSON.parse(raw);

      return saved[String(selectedDoctorId)] || defaultSlots;
    } catch {
      return defaultSlots;
    }
  };

  const validateDoctorAvailability = (
    selectedDoctorId: number,
    appointmentDate: Date,
    appointmentDuration: number
  ) => {
    const doctor = doctors.find(
      (item) => item.id === selectedDoctorId
    );

    if (!doctor) {
      return "Please select a doctor.";
    }

    if ((doctor.status ?? "ACTIVE").toUpperCase() !== "ACTIVE") {
      return "This doctor is not active and cannot receive new appointments.";
    }

    const day = appointmentDate.getDay();

    const slots = getDoctorAvailability(selectedDoctorId).filter(
      (slot: { day: number; startTime: string; endTime: string }) =>
        slot.day === day
    );

    if (slots.length === 0) {
      return `Dr. ${doctor.lastName} is not available on ${appointmentDate.toLocaleDateString(
        "en-IN",
        { weekday: "long" }
      )}.`;
    }

    const startMinutes =
      appointmentDate.getHours() * 60 + appointmentDate.getMinutes();

    const endMinutes = startMinutes + appointmentDuration;

    const insideSlot = slots.some(
      (slot: { startTime: string; endTime: string }) => {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);

        const slotStart = sh * 60 + sm;
        const slotEnd = eh * 60 + em;

        return startMinutes >= slotStart && endMinutes <= slotEnd;
      }
    );

    if (!insideSlot) {
      return "The selected appointment time and duration fall outside the doctor's availability.";
    }

    const requestedStart = appointmentDate.getTime();
    const requestedEnd =
      requestedStart + appointmentDuration * 60 * 1000;

    const overlaps = appointments.some((appointment) => {
      if (appointment.doctorId !== selectedDoctorId) {
        return false;
      }

      const status = appointment.status.toUpperCase();

      if (
        status === "CANCELLED" ||
        status === "COMPLETED" ||
        status === "NO_SHOW"
      ) {
        return false;
      }

      const existingStart = new Date(
        appointment.appointmentAt
      ).getTime();

      const existingEnd =
        existingStart + Number(appointment.duration) * 60 * 1000;

      return (
        requestedStart < existingEnd && requestedEnd > existingStart
      );
    });

    if (overlaps) {
      return "The selected doctor already has an overlapping appointment.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!patientId) {
        throw new Error("Please select a patient.");
      }

      if (!doctorId) {
        throw new Error("Please select a doctor.");
      }

      if (!appointmentAt) {
        throw new Error(
          "Please select an appointment date and time."
        );
      }

      const selectedDate = new Date(appointmentAt);

      if (Number.isNaN(selectedDate.getTime())) {
        throw new Error(
          "Please select a valid appointment date and time."
        );
      }

      const availabilityError = validateDoctorAvailability(
        Number(doctorId),
        selectedDate,
        Number(duration)
      );

      if (availabilityError) {
        throw new Error(availabilityError);
      }

      const token = getAuthToken();

      const response = await fetch(
        "http://localhost:4000/api/appointments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentNo: `APT-${Date.now()}`,
            patientId: Number(patientId),
            doctorId: Number(doctorId),
            appointmentAt: selectedDate.toISOString(),
            duration: Number(duration),
            type,
            reason,
            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create appointment"
        );
      }

      navigate("/appointments");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">
              Loading appointment form...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="patients-header">
        <div>
          <h1>New Appointment</h1>
          <p>Schedule a new appointment for a patient.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/appointments")}
        >
          ← Back to Appointments
        </button>
      </header>

      <main className="patients-content">
        <div className="appointment-form-card">
          <div className="appointment-form-header">
            <div>
              <div className="appointment-icon">📅</div>
              <div>
                <h2>Appointment Details</h2>
                <p>
                  Enter the details below to schedule an appointment.
                </p>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="appointment-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Patient & Doctor</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="patient">Patient</label>
                  <select
                    id="patient"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.medicalId} — {patient.firstName}{" "}
                        {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="doctor">Doctor</label>
                  <select
                    id="doctor"
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
              </div>
            </div>

            <div className="form-section">
              <h3>Schedule</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appointmentAt">Date & Time</label>
                  <input
                    id="appointmentAt"
                    type="datetime-local"
                    value={appointmentAt}
                    onChange={(e) => setAppointmentAt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Appointment Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="type">Appointment Type</label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                    placeholder="Routine consultation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/appointments")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Appointment..."
                  : "Create Appointment"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default NewAppointment;
