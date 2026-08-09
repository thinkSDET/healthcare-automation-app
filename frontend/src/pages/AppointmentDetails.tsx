import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
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
  notes: string;

  patient?: {
    id: number;
    medicalId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  doctor?: {
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    email: string;
    phone: string;
  };
}

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Token is provided by AuthContext.
       *
       * AuthContext handles whether the token
       * comes from localStorage or sessionStorage.
       */
      const currentToken = token;

      const response = await fetch(
        `http://localhost:4000/api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to fetch appointment"
        );
      }

      setAppointment(result.data);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch appointment"
      );

    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      /*
       * Use token from AuthContext.
       */
      const currentToken = token;

      const response = await fetch(
        `http://localhost:4000/api/appointments/${id}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to cancel appointment"
        );
      }

      setAppointment(
        result.data
      );

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel appointment"
      );

    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page">

        <main className="patients-content">

          <div className="patients-card">

            <div className="loading">
              Loading appointment...
            </div>

          </div>

        </main>

      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="page">

        <main className="patients-content">

          <div className="patients-card">

            <div className="error-message">
              {error}
            </div>

            <div className="details-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  navigate(
                    "/appointments"
                  )
                }
              >
                ← Back to Appointments
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="page">

      {/* Page Header */}

      <header className="patients-header">

        <div>

          <h1>
            Appointment Details
          </h1>

          <p>
            View appointment information
            and manage appointment status.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate(
              "/appointments"
            )
          }
        >
          ← Back
        </button>

      </header>

      {/* Main Content */}

      <main className="patients-content">

        <div className="appointment-details-card">

          {/* Appointment Header */}

          <div className="details-header">

            <div>

              <span className="details-label">
                Appointment
              </span>

              <h2>
                {
                  appointment.appointmentNo
                }
              </h2>

            </div>

            <span className="status-badge">
              {appointment.status}
            </span>

          </div>

          {/* Error */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Appointment Information */}

          <section className="details-section">

            <h3>
              Appointment Information
            </h3>

            <div className="details-grid">

              <div className="detail-item">

                <span>
                  Date & Time
                </span>

                <strong>
                  {formatDateTime(
                    appointment.appointmentAt
                  )}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Duration
                </span>

                <strong>
                  {
                    appointment.duration
                  }{" "}
                  minutes
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Type
                </span>

                <strong>
                  {appointment.type}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Reason
                </span>

                <strong>
                  {appointment.reason}
                </strong>

              </div>

            </div>

          </section>

          {/* Patient Information */}

          <section className="details-section">

            <h3>
              Patient Information
            </h3>

            {appointment.patient ? (

              <div className="person-card">

                <div className="person-icon">
                  👤
                </div>

                <div>

                  <strong>
                    {
                      appointment.patient
                        .firstName
                    }{" "}
                    {
                      appointment.patient
                        .lastName
                    }
                  </strong>

                  <span>
                    Medical ID:{" "}
                    {
                      appointment.patient
                        .medicalId
                    }
                  </span>

                  <span>
                    {
                      appointment.patient
                        .email
                    }
                  </span>

                  <span>
                    {
                      appointment.patient
                        .phone
                    }
                  </span>

                </div>

              </div>

            ) : (

              <div className="notes-box">
                Patient #
                {
                  appointment.patientId
                }
              </div>

            )}

          </section>

          {/* Doctor Information */}

          <section className="details-section">

            <h3>
              Doctor Information
            </h3>

            {appointment.doctor ? (

              <div className="person-card">

                <div className="person-icon">
                  🩺
                </div>

                <div>

                  <strong>
                    Dr.{" "}
                    {
                      appointment.doctor
                        .firstName
                    }{" "}
                    {
                      appointment.doctor
                        .lastName
                    }
                  </strong>

                  <span>
                    Doctor Code:{" "}
                    {
                      appointment.doctor
                        .doctorCode
                    }
                  </span>

                  <span>
                    {
                      appointment.doctor
                        .specialization
                    }
                  </span>

                  <span>
                    {
                      appointment.doctor
                        .email
                    }
                  </span>

                  <span>
                    {
                      appointment.doctor
                        .phone
                    }
                  </span>

                </div>

              </div>

            ) : (

              <div className="notes-box">
                Doctor #
                {
                  appointment.doctorId
                }
              </div>

            )}

          </section>

          {/* Notes */}

          {appointment.notes && (
            <section className="details-section">

              <h3>
                Notes
              </h3>

              <div className="notes-box">
                {appointment.notes}
              </div>

            </section>
          )}

          {/* Actions */}

          <div className="details-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/appointments"
                )
              }
            >
              Back to Appointments
            </button>

            {appointment.status !==
              "CANCELLED" && (

              <button
                className="danger-button"
                onClick={
                  cancelAppointment
                }
                disabled={cancelling}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Appointment"}
              </button>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default AppointmentDetails;