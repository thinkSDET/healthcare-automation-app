import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
}

function NewAppointment() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

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
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [patientsResponse, doctorsResponse] =
        await Promise.all([
          fetch("http://localhost:4000/api/patients", {
            headers,
          }),
          fetch("http://localhost:4000/api/doctors", {
            headers,
          }),
        ]);

      const patientsResult =
        await patientsResponse.json();

      const doctorsResult =
        await doctorsResponse.json();

      if (
        patientsResponse.ok &&
        patientsResult.success
      ) {
        setPatients(patientsResult.data);
      }

      if (
        doctorsResponse.ok &&
        doctorsResult.success
      ) {
        setDoctors(doctorsResult.data);
      }
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load patients and doctors."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

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
            appointmentAt: new Date(
              appointmentAt
            ).toISOString(),
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
          result.message ||
            "Failed to create appointment"
        );
      }

      navigate("/appointments");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
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

      {/* Header */}

      <header className="patients-header">
        <div>
          <h1>New Appointment</h1>

          <p>
            Schedule a new appointment for a patient.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/appointments")
          }
        >
          ← Back
        </button>
      </header>

      {/* Content */}

      <main className="patients-content">

        <div className="appointment-form-card">

          {/* Card Header */}

          <div className="appointment-form-header">

            <div>
              <div className="appointment-icon">
                📅
              </div>

              <div>
                <h2>Appointment Details</h2>

                <p>
                  Enter the details below to schedule
                  an appointment.
                </p>
              </div>
            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form */}

          <form
            className="appointment-form"
            onSubmit={handleSubmit}
          >

            {/* Patient + Doctor */}

            <div className="form-section">

              <h3>Patient & Doctor</h3>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="patient">
                    Patient
                  </label>

                  <select
                    id="patient"
                    value={patientId}
                    onChange={(e) =>
                      setPatientId(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select patient
                    </option>

                    {patients.map((patient) => (
                      <option
                        key={patient.id}
                        value={patient.id}
                      >
                        {patient.medicalId} —{" "}
                        {patient.firstName}{" "}
                        {patient.lastName}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="doctor">
                    Doctor
                  </label>

                  <select
                    id="doctor"
                    value={doctorId}
                    onChange={(e) =>
                      setDoctorId(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select doctor
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        Dr. {doctor.firstName}{" "}
                        {doctor.lastName} —{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </div>

            {/* Schedule */}

            <div className="form-section">

              <h3>Schedule</h3>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="appointmentAt">
                    Date & Time
                  </label>

                  <input
                    id="appointmentAt"
                    type="datetime-local"
                    value={appointmentAt}
                    onChange={(e) =>
                      setAppointmentAt(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="duration">
                    Duration
                  </label>

                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value)
                    }
                  >
                    <option value="15">
                      15 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      60 minutes
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* Appointment Type */}

            <div className="form-section">

              <h3>Appointment Information</h3>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="type">
                    Appointment Type
                  </label>

                  <select
                    id="type"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value)
                    }
                  >
                    <option value="IN_PERSON">
                      In Person
                    </option>

                    <option value="VIDEO">
                      Video Consultation
                    </option>

                    <option value="PHONE">
                      Phone Consultation
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="reason">
                    Reason for Visit
                  </label>

                  <input
                    id="reason"
                    type="text"
                    placeholder="Routine consultation"
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Actions */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate("/appointments")
                }
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