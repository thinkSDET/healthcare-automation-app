import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
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
  };

  doctor?: {
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

function Appointments() {
  const { token, user } = useAuth();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const [searchParams] =
    useSearchParams();

  const patientIdParam =
    searchParams.get("patientId");

  const filteredPatientId =
    patientIdParam &&
    !Number.isNaN(Number(patientIdParam))
      ? Number(patientIdParam)
      : null;

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      /*
       * Token is provided by AuthContext.
       *
       * AuthContext handles whether the token
       * comes from localStorage or sessionStorage.
       */
      const currentToken = token;

      const response = await fetch(
        "http://localhost:4000/api/appointments",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result =
        await response.json();

      console.log(
        "Appointments API response:",
        result
      );

      if (
        response.ok &&
        result.success
      ) {
        setAppointments(
          result.data
        );
      }

    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        if (
          filteredPatientId !== null &&
          appointment.patientId !==
            filteredPatientId
        ) {
          return false;
        }

        const searchText =
          search.toLowerCase();

        const patientName =
          `${appointment.patient?.firstName ?? ""} ${
            appointment.patient?.lastName ?? ""
          }`.toLowerCase();

        const doctorName =
          `${appointment.doctor?.firstName ?? ""} ${
            appointment.doctor?.lastName ?? ""
          }`.toLowerCase();

        return (
          appointment.appointmentNo
            .toLowerCase()
            .includes(searchText) ||

          patientName.includes(
            searchText
          ) ||

          doctorName.includes(
            searchText
          ) ||

          appointment.status
            .toLowerCase()
            .includes(searchText)
        );
      }
    );

  const formatDateTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div className="page">

      <header className="patients-header">

        <div>

          <h1>
            Appointments
          </h1>

          <p>
            {filteredPatientId !== null
              ? `Showing appointments for patient #${filteredPatientId}.`
              : "Schedule and manage patient appointments."}
          </p>

        </div>

        {isAdmin && (
          <button
            className="primary-button"
            onClick={() =>
              navigate(
                "/appointments/new"
              )
            }
          >
            + New Appointment
          </button>
        )}

      </header>

      <main className="patients-content">

        <div className="patients-card">

          <div className="table-header">

            <h2>
              Appointment Records
            </h2>

            <input
              type="text"
              placeholder="Search appointments..."
              className="search-input"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {loading ? (

            <div className="loading">
              Loading appointments...
            </div>

          ) : filteredAppointments.length === 0 ? (

            <div className="empty-state">
              No appointments found.
            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>
                      Appointment
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Date & Time
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Duration
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredAppointments.map(
                    (appointment) => (

                      <tr
                        key={
                          appointment.id
                        }
                        className="clickable-row"
                        onClick={() =>
                          navigate(
                            `/appointments/${appointment.id}`
                          )
                        }
                      >

                        <td>

                          <strong>
                            {
                              appointment.appointmentNo
                            }
                          </strong>

                        </td>

                        <td>

                          <strong>
                            {appointment.patient
                              ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                              : `Patient #${appointment.patientId}`}
                          </strong>

                          {appointment.patient && (
                            <small>
                              {
                                appointment
                                  .patient
                                  .medicalId
                              }
                            </small>
                          )}

                        </td>

                        <td>

                          <strong>
                            {appointment.doctor
                              ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : `Doctor #${appointment.doctorId}`}
                          </strong>

                          {appointment.doctor && (
                            <small>
                              {
                                appointment
                                  .doctor
                                  .specialization
                              }
                            </small>
                          )}

                        </td>

                        <td>
                          {formatDateTime(
                            appointment.appointmentAt
                          )}
                        </td>

                        <td>
                          {appointment.type}
                        </td>

                        <td>
                          {
                            appointment.duration
                          }{" "}
                          mins
                        </td>

                        <td>

                          <span className="status-badge">
                            {
                              appointment.status
                            }
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Appointments;