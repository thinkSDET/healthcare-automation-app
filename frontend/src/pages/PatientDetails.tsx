import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
   const { token, user } = useAuth();

  const isAdmin =
    user?.role?.toUpperCase() === "ADMIN";

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editing, setEditing] =
    useState(false);

    const [deactivating, setDeactivating] = useState(false);

  const [formData, setFormData] = useState({
    medicalId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
    phone: "",
    address: "",
    bloodGroup: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const getToken = () => {
    return (
      token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch patient"
        );
      }

      setPatient(result.data);

      populateForm(result.data);
    } catch (error) {
      console.error(
        "Failed to fetch patient:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch patient"
      );
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (
    data: Patient
  ) => {
    setFormData({
      medicalId: data.medicalId || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      dateOfBirth: data.dateOfBirth
        ? data.dateOfBirth.substring(0, 10)
        : "",
      gender: data.gender || "MALE",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      bloodGroup: data.bloodGroup || "",
      status: data.status || "ACTIVE",
    });
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    if (!patient) {
      return;
    }

    populateForm(patient);

    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (patient) {
      populateForm(patient);
    }

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicalId:
              formData.medicalId,
            firstName:
              formData.firstName,
            lastName:
              formData.lastName,
            dateOfBirth:
              formData.dateOfBirth,
            gender:
              formData.gender,
            email:
              formData.email,
            phone:
              formData.phone,
            address:
              formData.address,
            bloodGroup:
              formData.bloodGroup,
            status:
              formData.status,
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "Update patient response:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update patient"
        );
      }

      setPatient(result.data);

      populateForm(result.data);

      setEditing(false);

      setSuccess(
        "Patient updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update patient:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update patient"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDeactivate = async () => {
  if (!patient) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${patient.firstName} ${patient.lastName}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeactivating(true);
    setError("");
    setSuccess("");

    const response = await fetch(
      `http://localhost:4000/api/patients/${patient.id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Failed to deactivate patient"
      );
    }

    setPatient(result.data);

    populateForm(result.data);

    setSuccess(
      "Patient deactivated successfully."
    );
  } catch (error) {
    console.error(
      "Failed to deactivate patient:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Failed to deactivate patient"
    );
  } finally {
    setDeactivating(false);
  }
};

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">
              Loading patient details...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="patients-page">

        <header className="patients-header">
          <div>
            <h1>
              Patient Details
            </h1>

            <p>
              Unable to load patient
              information.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/patients")
            }
          >
            ← Back to Patients
          </button>
        </header>

        <main className="patients-content">
          <div className="patients-card">
            <div
              className="empty-state"
              style={{
                color: "#b42318",
              }}
            >
              {error}
            </div>
          </div>
        </main>

      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="patients-page">

      {/* =========================
          Header
      ========================= */}

      <header className="patients-header">

        <div>
          <h1>
            Patient Details
          </h1>

          <p>
            View and manage patient
            information.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/patients")
          }
        >
          ← Back to Patients
        </button>

      </header>

      <main className="patients-content">

        <div className="patients-card patient-details-card">

          {/* =========================
              Patient Header
          ========================= */}

          <div className="patient-details-header">

            <div className="patient-profile">

              <div className="patient-avatar">
                {patient.firstName
                  .charAt(0)
                  .toUpperCase()}

                {patient.lastName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <h2>
                  {patient.firstName}{" "}
                  {patient.lastName}
                </h2>

                <p>
                  Medical ID:{" "}
                  <strong>
                    {patient.medicalId}
                  </strong>
                </p>

              </div>

            </div>

            <span className="status-badge">
              {patient.status}
            </span>

          </div>

          {/* =========================
              Success / Error
          ========================= */}

          {error && (
            <div
              className="auth-error"
              style={{
                margin: "20px 30px 0",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              style={{
                margin: "20px 30px 0",
              }}
            >
              {success}
            </div>
          )}

          {/* =========================
              EDIT MODE
          ========================= */}

          {editing ? (

            <form
              onSubmit={handleUpdate}
              className="patient-edit-form"
            >

              <section className="patient-details-section">

                <h3>
                  Edit Patient Information
                </h3>

                <div className="patient-edit-grid">

                  <div className="form-group">
                    <label>
                      Medical ID
                    </label>

                    <input
                      type="text"
                      value={
                        formData.medicalId
                      }
                      onChange={(e) =>
                        handleChange(
                          "medicalId",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      First Name
                    </label>

                    <input
                      type="text"
                      value={
                        formData.firstName
                      }
                      onChange={(e) =>
                        handleChange(
                          "firstName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Last Name
                    </label>

                    <input
                      type="text"
                      value={
                        formData.lastName
                      }
                      onChange={(e) =>
                        handleChange(
                          "lastName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      value={
                        formData.dateOfBirth
                      }
                      onChange={(e) =>
                        handleChange(
                          "dateOfBirth",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Gender
                    </label>

                    <select
                      value={
                        formData.gender
                      }
                      onChange={(e) =>
                        handleChange(
                          "gender",
                          e.target.value
                        )
                      }
                    >
                      <option value="MALE">
                        Male
                      </option>

                      <option value="FEMALE">
                        Female
                      </option>

                      <option value="OTHER">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Blood Group
                    </label>

                    <input
                      type="text"
                      value={
                        formData.bloodGroup
                      }
                      onChange={(e) =>
                        handleChange(
                          "bloodGroup",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={(e) =>
                        handleChange(
                          "email",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Phone
                    </label>

                    <input
                      type="text"
                      value={
                        formData.phone
                      }
                      onChange={(e) =>
                        handleChange(
                          "phone",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        formData.status
                      }
                      onChange={(e) =>
                        handleChange(
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>

                      <option value="DECEASED">
                        Deceased
                      </option>
                    </select>
                  </div>

                  <div className="form-group patient-address-field">
                    <label>
                      Address
                    </label>

                    <textarea
                      value={
                        formData.address
                      }
                      onChange={(e) =>
                        handleChange(
                          "address",
                          e.target.value
                        )
                      }
                      rows={4}
                    />
                  </div>

                </div>

              </section>

              <div className="patient-details-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          ) : (

            <>
              {/* =========================
                  Personal Information
              ========================= */}

              <section className="patient-details-section">

                <h3>
                  Personal Information
                </h3>

                <div className="patient-details-grid">

                  <div className="patient-detail-item">
                    <span>
                      First Name
                    </span>

                    <strong>
                      {patient.firstName}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Last Name
                    </span>

                    <strong>
                      {patient.lastName}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Date of Birth
                    </span>

                    <strong>
                      {formatDate(
                        patient.dateOfBirth
                      )}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Gender
                    </span>

                    <strong>
                      {patient.gender}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Blood Group
                    </span>

                    <strong>
                      {patient.bloodGroup ||
                        "-"}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Patient Status
                    </span>

                    <strong>
                      {patient.status}
                    </strong>
                  </div>

                </div>

              </section>

              {/* =========================
                  Contact
              ========================= */}

              <section className="patient-details-section">

                <h3>
                  Contact Information
                </h3>

                <div className="patient-details-grid">

                  <div className="patient-detail-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      {patient.email ||
                        "-"}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Phone
                    </span>

                    <strong>
                      {patient.phone}
                    </strong>
                  </div>

                </div>

              </section>

              {/* =========================
                  Address
              ========================= */}

              <section className="patient-details-section">

                <h3>
                  Address
                </h3>

                <div className="patient-address-box">
                  {patient.address ||
                    "No address available"}
                </div>

              </section>

              {/* =========================
                  Record Information
              ========================= */}

              <section className="patient-details-section">

                <h3>
                  Record Information
                </h3>

                <div className="patient-details-grid">

                  <div className="patient-detail-item">
                    <span>
                      Patient ID
                    </span>

                    <strong>
                      #{patient.id}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        patient.createdAt
                      )}
                    </strong>
                  </div>

                  <div className="patient-detail-item">
                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDate(
                        patient.updatedAt
                      )}
                    </strong>
                  </div>

                </div>

              </section>

              {/* =========================
                  Patient History
              ========================= */}

              <section className="patient-details-section">

                <h3>
                  Patient History
                </h3>

                <div className="patient-history-grid">

                  <div className="patient-history-card">
                    <span className="history-icon">
                      📅
                    </span>

                    <div>
                      <strong>
                        Appointments
                      </strong>

                      <p>
                        View appointment
                        history
                      </p>
                    </div>
                  </div>

                  <div className="patient-history-card">
                    <span className="history-icon">
                      💊
                    </span>

                    <div>
                      <strong>
                        Prescriptions
                      </strong>

                      <p>
                        View prescription
                        history
                      </p>
                    </div>
                  </div>

                  <div className="patient-history-card">
                    <span className="history-icon">
                      📦
                    </span>

                    <div>
                      <strong>
                        Orders
                      </strong>

                      <p>
                        View order history
                      </p>
                    </div>
                  </div>

                  <div className="patient-history-card">
                    <span className="history-icon">
                      📄
                    </span>

                    <div>
                      <strong>
                        Documents
                      </strong>

                      <p>
                        View patient
                        documents
                      </p>
                    </div>
                  </div>

                </div>

              </section>

              {/* =========================
                  Actions
              ========================= */}

              <div className="patient-details-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    navigate("/patients")
                  }
                >
                  ← Back to Patients
                </button>

                {patient.status === "ACTIVE" && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleEdit}
                    >
                      Edit Patient
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={handleDeactivate}
                      disabled={deactivating}
                    >
                      {deactivating
                        ? "Deactivating..."
                        : "Deactivate Patient"}
                    </button>
                  </>
                )}

              </div>
            </>
          )}

        </div>

      </main>

    </div>
  );
}

export default PatientDetails;