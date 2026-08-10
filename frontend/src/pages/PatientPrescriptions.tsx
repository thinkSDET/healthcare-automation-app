import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrescriptionItem {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string | null;
  instructions?: string | null;
}

interface Doctor {
  id: number;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Prescription {
  id: number;
  prescriptionNo: string;
  patientId: number;
  doctorId: number;
  prescribedAt: string;
  diagnosis?: string | null;
  notes?: string | null;
  status: string;
  doctor: Doctor;
  items: PrescriptionItem[];
}

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
}

function PatientPrescriptions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const role = user?.role?.toUpperCase();
  const isPharmacist = role === "PHARMACIST";

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>([]);

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [formData, setFormData] =
    useState({
      doctorId: "",
      prescribedAt: "",
      diagnosis: "",
      notes: "",
      status: "ACTIVE",
    });

  const [items, setItems] =
    useState<PrescriptionItem[]>([
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "ORAL",
        instructions: "",
      },
    ]);

  const getToken = () => {
    return (
      token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };

      const [
        patientResponse,
        prescriptionResponse,
        doctorsResponse,
      ] = await Promise.all([
        fetch(
          `http://localhost:4000/api/patients/${id}`,
          {
            headers,
          }
        ),

        fetch(
          `http://localhost:4000/api/prescriptions/patient/${id}`,
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:4000/api/doctors",
          {
            headers,
          }
        ),
      ]);

      const patientResult =
        await patientResponse.json();

      const prescriptionResult =
        await prescriptionResponse.json();

      const doctorsResult =
        await doctorsResponse.json();

      if (
        !patientResponse.ok ||
        !patientResult.success
      ) {
        throw new Error(
          patientResult.message ||
            "Failed to load patient"
        );
      }

      if (
        !prescriptionResponse.ok ||
        !prescriptionResult.success
      ) {
        throw new Error(
          prescriptionResult.message ||
            "Failed to load prescriptions"
        );
      }

      setPatient(patientResult.data);

      setPrescriptions(
        prescriptionResult.data || []
      );

      if (
        doctorsResponse.ok &&
        doctorsResult.success
      ) {
        setDoctors(
          doctorsResult.data || []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load prescription data:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load prescription data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItem,
    value: string
  ) => {
    setItems(
      (previous) =>
        previous.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  };

  const addMedicine = () => {
    setItems(
      (previous) => [
        ...previous,
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          route: "ORAL",
          instructions: "",
        },
      ]
    );
  };

  const removeMedicine = (
    index: number
  ) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  const resetForm = () => {
    setFormData({
      doctorId: "",
      prescribedAt: "",
      diagnosis: "",
      notes: "",
      status: "ACTIVE",
    });

    setItems([
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "ORAL",
        instructions: "",
      },
    ]);
  };

  const handleCreatePrescription =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        if (!formData.doctorId) {
          throw new Error(
            "Please select a doctor"
          );
        }

        const invalidItem =
          items.some(
            (item) =>
              !item.medicineName.trim() ||
              !item.dosage.trim() ||
              !item.frequency.trim() ||
              !item.duration.trim()
          );

        if (invalidItem) {
          throw new Error(
            "Please complete all required medicine fields"
          );
        }

        const response =
          await fetch(
            "http://localhost:4000/api/prescriptions",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                patientId:
                  Number(id),

                doctorId:
                  Number(
                    formData.doctorId
                  ),

                prescribedAt:
                  formData.prescribedAt
                    ? new Date(
                        formData.prescribedAt
                      ).toISOString()
                    : undefined,

                diagnosis:
                  formData.diagnosis,

                notes:
                  formData.notes,

                status:
                  formData.status,

                items,
              }),
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
              "Failed to create prescription"
          );
        }

        setPrescriptions(
          (previous) => [
            result.data,
            ...previous,
          ]
        );

        resetForm();

        setShowForm(false);

        setSuccess(
          "Prescription created successfully."
        );
      } catch (error) {
        console.error(
          "Create prescription error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to create prescription"
        );
      } finally {
        setSaving(false);
      }
    };

  const handleStatusChange =
    async (
      prescriptionId: number,
      status: string
    ) => {
      try {
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `http://localhost:4000/api/prescriptions/${prescriptionId}/status`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status,
              }),
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
              "Failed to update prescription"
          );
        }

        setPrescriptions(
          (previous) =>
            previous.map(
              (prescription) =>
                prescription.id ===
                prescriptionId
                  ? {
                      ...prescription,
                      status,
                    }
                  : prescription
            )
        );

        if (
          selectedPrescription?.id ===
          prescriptionId
        ) {
          setSelectedPrescription(
            (previous) =>
              previous
                ? {
                    ...previous,
                    status,
                  }
                : null
          );
        }

        setSuccess(
          "Prescription status updated successfully."
        );
      } catch (error) {
        console.error(
          "Update prescription status error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to update prescription status"
        );
      }
    };

  const handleDeletePrescription =
    async (
      prescriptionId: number
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this prescription?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `http://localhost:4000/api/prescriptions/${prescriptionId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
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
              "Failed to delete prescription"
          );
        }

        setPrescriptions(
          (previous) =>
            previous.filter(
              (prescription) =>
                prescription.id !==
                prescriptionId
            )
        );

        setSelectedPrescription(
          null
        );

        setSuccess(
          "Prescription deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete prescription error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete prescription"
        );
      }
    };

  const formatDate = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (
      status.toUpperCase()
    ) {
      case "ACTIVE":
        return "status-badge status-active";

      case "COMPLETED":
        return "status-badge status-completed";

      case "CANCELLED":
        return "status-badge status-cancelled";

      default:
        return "status-badge";
    }
  };

  if (loading) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">
              Loading prescriptions...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="empty-state">
              {error ||
                "Patient not found"}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="patients-page">

      {/* Header */}

      <header className="patients-header">

        <div>

          <h1>
            Prescription History
          </h1>

          <p>
            {patient.firstName}{" "}
            {patient.lastName}
            {" • "}
            Medical ID:{" "}
            <strong>
              {patient.medicalId}
            </strong>
          </p>

        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate(
              `/patients/${patient.id}`
            )
          }
        >
          ← Back to Patient
        </button>

      </header>


      <main className="patients-content">

        <div className="patients-card">


          {/* Messages */}

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


          {/* Prescription Header */}

          <section className="patient-details-section">

            <div className="section-heading-row">

              <div>

                <h3>
                  Prescriptions
                </h3>

                <p className="section-description">
                  Manage prescriptions and
                  prescribed medicines for
                  this patient.
                </p>

              </div>

              {!isPharmacist && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setShowForm(
                      !showForm
                    );
                  }}
                >
                  {showForm
                    ? "Cancel"
                    : "+ New Prescription"}
                </button>
              )}

            </div>


            {/* Create Form */}

            {!isPharmacist && showForm && (
              <form
                className="dependent-form prescription-form"
                onSubmit={
                  handleCreatePrescription
                }
              >

                <div className="patient-edit-grid">

                  <div className="form-group">

                    <label>
                      Doctor
                    </label>

                    <select
                      value={
                        formData.doctorId
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "doctorId",
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select doctor
                      </option>

                      {doctors.map(
                        (doctor) => (
                          <option
                            key={
                              doctor.id
                            }
                            value={
                              doctor.id
                            }
                          >
                            Dr.{" "}
                            {
                              doctor.firstName
                            }{" "}
                            {
                              doctor.lastName
                            }{" "}
                            -{" "}
                            {
                              doctor.specialization
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Prescribed Date
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        formData.prescribedAt
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "prescribedAt",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Diagnosis
                    </label>

                    <input
                      type="text"
                      value={
                        formData.diagnosis
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "diagnosis",
                          e.target.value
                        )
                      }
                      placeholder="Enter diagnosis"
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
                        handleFormChange(
                          "status",
                          e.target.value
                        )
                      }
                    >

                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="COMPLETED">
                        Completed
                      </option>

                      <option value="CANCELLED">
                        Cancelled
                      </option>

                    </select>

                  </div>


                  <div className="form-group patient-address-field">

                    <label>
                      Notes
                    </label>

                    <textarea
                      rows={3}
                      value={
                        formData.notes
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="Additional prescription notes"
                    />

                  </div>

                </div>


                {/* Medicines */}

                <div className="prescription-medicines">

                  <div className="section-heading-row">

                    <div>

                      <h4>
                        Medicines
                      </h4>

                      <p className="section-description">
                        Add one or more medicines.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        addMedicine
                      }
                    >
                      + Add Medicine
                    </button>

                  </div>


                  {items.map(
                    (item, index) => (

                      <div
                        className="prescription-medicine-card"
                        key={index}
                      >

                        <div className="prescription-medicine-header">

                          <strong>
                            Medicine{" "}
                            {index + 1}
                          </strong>

                          {items.length >
                            1 && (
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() =>
                                removeMedicine(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>
                          )}

                        </div>


                        <div className="patient-edit-grid">

                          <div className="form-group">

                            <label>
                              Medicine Name
                            </label>

                            <input
                              type="text"
                              value={
                                item.medicineName
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "medicineName",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Amoxicillin"
                              required
                            />

                          </div>


                          <div className="form-group">

                            <label>
                              Dosage
                            </label>

                            <input
                              type="text"
                              value={
                                item.dosage
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 500 mg"
                              required
                            />

                          </div>


                          <div className="form-group">

                            <label>
                              Frequency
                            </label>

                            <input
                              type="text"
                              value={
                                item.frequency
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 3 times/day"
                              required
                            />

                          </div>


                          <div className="form-group">

                            <label>
                              Duration
                            </label>

                            <input
                              type="text"
                              value={
                                item.duration
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 5 days"
                              required
                            />

                          </div>


                          <div className="form-group">

                            <label>
                              Route
                            </label>

                            <select
                              value={
                                item.route ||
                                "ORAL"
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "route",
                                  e.target.value
                                )
                              }
                            >

                              <option value="ORAL">
                                Oral
                              </option>

                              <option value="TOPICAL">
                                Topical
                              </option>

                              <option value="INJECTION">
                                Injection
                              </option>

                              <option value="INHALATION">
                                Inhalation
                              </option>

                              <option value="OTHER">
                                Other
                              </option>

                            </select>

                          </div>


                          <div className="form-group">

                            <label>
                              Instructions
                            </label>

                            <input
                              type="text"
                              value={
                                item.instructions ||
                                ""
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "instructions",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. After food"
                            />

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>


                <div className="form-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      resetForm();
                      setShowForm(
                        false
                      );
                    }}
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
                      ? "Creating..."
                      : "Create Prescription"}
                  </button>

                </div>

              </form>
            )}

          </section>


          {/* Prescription List */}

          <section className="patient-details-section">

            {prescriptions.length ===
            0 ? (

              <div className="empty-state">

                <div
                  style={{
                    fontSize: "36px",
                    marginBottom: "10px",
                  }}
                >
                  💊
                </div>

                <strong>
                  No prescriptions found
                </strong>

                <p>
                  Create the first
                  prescription for this
                  patient.
                </p>

              </div>

            ) : (

              <div className="prescription-list">

                {prescriptions.map(
                  (prescription) => (

                    <div
                      className="prescription-card"
                      key={
                        prescription.id
                      }
                    >

                      <div className="prescription-card-header">

                        <div>

                          <strong>
                            {
                              prescription.prescriptionNo
                            }
                          </strong>

                          <span>
                            {formatDateTime(
                              prescription.prescribedAt
                            )}
                          </span>

                        </div>

                        <span
                          className={getStatusClass(
                            prescription.status
                          )}
                        >
                          {
                            prescription.status
                          }
                        </span>

                      </div>


                      <div className="prescription-doctor">

                        <span>
                          Doctor
                        </span>

                        <strong>
                          Dr.{" "}
                          {
                            prescription
                              .doctor
                              .firstName
                          }{" "}
                          {
                            prescription
                              .doctor
                              .lastName
                          }
                        </strong>

                        <small>
                          {
                            prescription
                              .doctor
                              .specialization
                          }
                        </small>

                      </div>


                      {prescription.diagnosis && (
                        <div className="prescription-diagnosis">

                          <span>
                            Diagnosis
                          </span>

                          <strong>
                            {
                              prescription.diagnosis
                            }
                          </strong>

                        </div>
                      )}


                      <div className="prescription-items-summary">

                        <span>
                          Medicines
                        </span>

                        <strong>
                          {
                            prescription.items
                              .length
                          }
                        </strong>

                      </div>


                      <div className="prescription-card-actions">

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            setSelectedPrescription(
                              prescription
                            )
                          }
                        >
                          View Details
                        </button>


                        {!isPharmacist && (
                          <>
                            {prescription.status ===
                              "ACTIVE" && (
                              <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleStatusChange(
                                prescription.id,
                                "COMPLETED"
                              )
                            }
                          >
                            Mark Completed
                              </button>
                            )}


                            {prescription.status !==
                              "CANCELLED" && (
                              <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleStatusChange(
                                prescription.id,
                                "CANCELLED"
                              )
                            }
                          >
                            Cancel
                              </button>
                            )}
                          </>
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>


          {/* Prescription Details */}

          {selectedPrescription && (

            <section className="patient-details-section">

              <div className="section-heading-row">

                <div>

                  <h3>
                    Prescription Details
                  </h3>

                  <p className="section-description">
                    {
                      selectedPrescription
                        .prescriptionNo
                    }
                  </p>

                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setSelectedPrescription(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>


              <div className="prescription-detail-header">

                <div>

                  <span>
                    Doctor
                  </span>

                  <strong>
                    Dr.{" "}
                    {
                      selectedPrescription
                        .doctor
                        .firstName
                    }{" "}
                    {
                      selectedPrescription
                        .doctor
                        .lastName
                    }
                  </strong>

                  <small>
                    {
                      selectedPrescription
                        .doctor
                        .specialization
                    }
                  </small>

                </div>


                <div>

                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedPrescription
                        .prescribedAt
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      selectedPrescription
                        .status
                    }
                  </strong>

                </div>

              </div>


              <div className="prescription-medicine-table">

                <div className="prescription-table-header">

                  <span>
                    Medicine
                  </span>

                  <span>
                    Dosage
                  </span>

                  <span>
                    Frequency
                  </span>

                  <span>
                    Duration
                  </span>

                  <span>
                    Route
                  </span>

                </div>


                {selectedPrescription.items.map(
                  (item, index) => (

                    <div
                      className="prescription-table-row"
                      key={
                        item.id ||
                        index
                      }
                    >

                      <strong>
                        {
                          item.medicineName
                        }
                      </strong>

                      <span>
                        {
                          item.dosage
                        }
                      </span>

                      <span>
                        {
                          item.frequency
                        }
                      </span>

                      <span>
                        {
                          item.duration
                        }
                      </span>

                      <span>
                        {
                          item.route ||
                          "-"
                        }
                      </span>

                      {item.instructions && (
                        <small>
                          {
                            item.instructions
                          }
                        </small>
                      )}

                    </div>

                  )
                )}

              </div>


              {selectedPrescription.notes && (
                <div className="prescription-notes">

                  <span>
                    Notes
                  </span>

                  <p>
                    {
                      selectedPrescription
                        .notes
                    }
                  </p>

                </div>
              )}


              {!isPharmacist && (
                <div className="patient-details-actions">

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      handleDeletePrescription(
                        selectedPrescription.id
                      )
                    }
                  >
                    Delete Prescription
                  </button>

                </div>
              )}

            </section>

          )}

        </div>

      </main>

    </div>
  );
}

export default PatientPrescriptions;