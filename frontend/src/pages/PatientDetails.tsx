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

interface Dependent {
  id: number;
  patientId: number;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientDocument {
  id: number;
  originalName: string;
  documentType: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface EmergencyContact {
  id: number;
  patientId: number;
  firstName?: string;
  lastName?: string;
  // Kept optional for backward compatibility if an older API response returns name.
  name?: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}


function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

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

  const [deactivating, setDeactivating] =
    useState(false);

  const [dependents, setDependents] =
    useState<Dependent[]>([]);

  const [showDependentForm, setShowDependentForm] =
    useState(false);

  const [dependentLoading, setDependentLoading] =
    useState(false);

  const [dependentForm, setDependentForm] =
    useState({
      firstName: "",
      lastName: "",
      relationship: "",
      dateOfBirth: "",
      gender: "OTHER",
      phone: "",
      email: "",
    });

  const [documents, setDocuments] =
    useState<PatientDocument[]>([]);

  const [documentLoading, setDocumentLoading] =
    useState(false);

  const [uploadingDocument, setUploadingDocument] =
    useState(false);

  const [documentType, setDocumentType] =
    useState("MEDICAL_RECORD");


  const [emergencyContact, setEmergencyContact] =
    useState<EmergencyContact | null>(null);

  const [emergencyContactLoading, setEmergencyContactLoading] =
    useState(false);

  const [savingEmergencyContact, setSavingEmergencyContact] =
    useState(false);

  const [editingEmergencyContact, setEditingEmergencyContact] =
    useState(false);

  const [emergencyContactForm, setEmergencyContactForm] =
    useState({
      name: "",
      relationship: "",
      phone: "",
      alternatePhone: "",
      email: "",
      address: "",
    });

  const [formData, setFormData] =
    useState({
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
    fetchDependents();
    fetchDocuments();
    fetchEmergencyContact();
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

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
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

  const fetchDocuments = async () => {
    try {
      setDocumentLoading(true);

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
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
            "Failed to fetch documents"
        );
      }

      setDocuments(result.data);
    } catch (error) {
      console.error(
        "Failed to fetch documents:",
        error
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const getEmergencyContactName = (contact: EmergencyContact) => {
    return (
      contact.name?.trim() ||
      [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
    );
  };

  const fetchEmergencyContact = async () => {
    try {
      setEmergencyContactLoading(true);

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/emergency-contact`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.status === 404) {
        setEmergencyContact(null);
        setEmergencyContactForm({
          name: "",
          relationship: "",
          phone: "",
          alternatePhone: "",
          email: "",
          address: "",
        });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch emergency contact"
        );
      }

      const contact = result.data
        ? {
            ...result.data,
            name: getEmergencyContactName(result.data),
          }
        : null;

      setEmergencyContact(contact);

      if (contact) {
        setEmergencyContactForm({
          name: getEmergencyContactName(contact),
          relationship: contact.relationship || "",
          phone: contact.phone || "",
          alternatePhone: contact.alternatePhone || "",
          email: contact.email || "",
          address: contact.address || "",
        });
      }
    } catch (error) {
      console.error(
        "Failed to fetch emergency contact:",
        error
      );
    } finally {
      setEmergencyContactLoading(false);
    }
  };

  const handleEmergencyContactChange = (
    field: keyof typeof emergencyContactForm,
    value: string
  ) => {
    setEmergencyContactForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveEmergencyContact = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const nameParts = emergencyContactForm.name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (nameParts.length < 2) {
      setError(
        "Please enter both first name and last name for the emergency contact."
      );
      setSuccess("");
      return;
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      setSavingEmergencyContact(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/emergency-contact`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            relationship: emergencyContactForm.relationship,
            phone: emergencyContactForm.phone,
            alternatePhone: emergencyContactForm.alternatePhone,
            email: emergencyContactForm.email,
            address: emergencyContactForm.address,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save emergency contact"
        );
      }

      const savedContact = result.data
        ? {
            ...result.data,
            name: getEmergencyContactName(result.data),
          }
        : null;

      setEmergencyContact(savedContact);
      setEditingEmergencyContact(false);

      setSuccess(
        "Emergency contact saved successfully."
      );
    } catch (error) {
      console.error(
        "Emergency contact save error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save emergency contact"
      );
    } finally {
      setSavingEmergencyContact(false);
    }
  };

  const handleEditEmergencyContact = () => {
    if (emergencyContact) {
      setEmergencyContactForm({
        name: getEmergencyContactName(emergencyContact),
        relationship:
          emergencyContact.relationship || "",
        phone: emergencyContact.phone || "",
        alternatePhone:
          emergencyContact.alternatePhone || "",
        email: emergencyContact.email || "",
        address: emergencyContact.address || "",
      });
    }

    setError("");
    setSuccess("");
    setEditingEmergencyContact(true);
  };

  const handleCancelEmergencyContactEdit = () => {
    if (emergencyContact) {
      setEmergencyContactForm({
        name: getEmergencyContactName(emergencyContact),
        relationship:
          emergencyContact.relationship || "",
        phone: emergencyContact.phone || "",
        alternatePhone:
          emergencyContact.alternatePhone || "",
        email: emergencyContact.email || "",
        address: emergencyContact.address || "",
      });
    } else {
      setEmergencyContactForm({
        name: "",
        relationship: "",
        phone: "",
        alternatePhone: "",
        email: "",
        address: "",
      });
    }

    setError("");
    setSuccess("");
    setEditingEmergencyContact(false);
  };

  const handleDeleteEmergencyContact = async () => {
    if (!emergencyContact) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this emergency contact?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setEmergencyContactLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/emergency-contact`,
        {
          method: "DELETE",
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
            "Failed to remove emergency contact"
        );
      }

      setEmergencyContact(null);
      setEmergencyContactForm({
        name: "",
        relationship: "",
        phone: "",
        alternatePhone: "",
        email: "",
        address: "",
      });

      setEditingEmergencyContact(false);

      setSuccess(
        "Emergency contact removed successfully."
      );
    } catch (error) {
      console.error(
        "Emergency contact delete error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove emergency contact"
      );
    } finally {
      setEmergencyContactLoading(false);
    }
  };

  const fetchDependents = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {
        setDependents(result.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch dependents:",
        error
      );
    }
  };

  const handleDependentChange = (
    field: keyof typeof dependentForm,
    value: string
  ) => {
    setDependentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleAddDependent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setDependentLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            dependentForm
          ),
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
            "Failed to add dependent"
        );
      }

      setDependents((previous) => [
        result.data,
        ...previous,
      ]);

      setDependentForm({
        firstName: "",
        lastName: "",
        relationship: "",
        dateOfBirth: "",
        gender: "OTHER",
        phone: "",
        email: "",
      });

      setShowDependentForm(false);

      setSuccess(
        "Dependent added successfully."
      );
    } catch (error) {
      console.error(
        "Failed to add dependent:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add dependent"
      );
    } finally {
      setDependentLoading(false);
    }
  };

  const handleDocumentDelete = async (
    documentId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
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
            "Failed to delete document"
        );
      }

      setDocuments(
        (previous) =>
          previous.filter(
            (document) =>
              document.id !==
              documentId
          )
      );

      setSuccess(
        "Document deleted successfully."
      );
    } catch (error) {
      console.error(
        "Document delete error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete document"
      );
    }
  };

  const handleDocumentDownload = async (
    documentId: number,
    fileName: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents/${documentId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const result =
          await response.json();

        throw new Error(
          result.message ||
            "Failed to download document"
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        "Document download error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download document"
      );
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingDocument(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "document",
        file
      );

      formData.append(
        "documentType",
        documentType
      );

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
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
            "Failed to upload document"
        );
      }

      setDocuments(
        (previous) => [
          result.data,
          ...previous,
        ]
      );

      setSuccess(
        "Document uploaded successfully."
      );

      e.target.value = "";
    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload document"
      );
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDependent = async (
    dependentId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this dependent?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents/${dependentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
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
            "Failed to remove dependent"
        );
      }

      setDependents(
        (previous) =>
          previous.filter(
            (dependent) =>
              dependent.id !==
              dependentId
          )
      );

      setSuccess(
        "Dependent removed successfully."
      );
    } catch (error) {
      console.error(
        "Failed to remove dependent:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove dependent"
      );
    }
  };

  const populateForm = (
    data: Patient
  ) => {
    setFormData({
      medicalId:
        data.medicalId || "",
      firstName:
        data.firstName || "",
      lastName:
        data.lastName || "",
      dateOfBirth:
        data.dateOfBirth
          ? data.dateOfBirth.substring(
              0,
              10
            )
          : "",
      gender:
        data.gender || "MALE",
      email:
        data.email || "",
      phone:
        data.phone || "",
      address:
        data.address || "",
      bloodGroup:
        data.bloodGroup || "",
      status:
        data.status || "ACTIVE",
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
            "Content-Type":
              "application/json",
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

    const confirmed =
      window.confirm(
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

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
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
                margin:
                  "20px 30px 0",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              style={{
                margin:
                  "20px 30px 0",
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
                  Emergency Contact
              ========================= */}

              <section className="patient-details-section">

                <div className="section-heading-row">

                  <div>
                    <h3>
                      Emergency Contact
                    </h3>

                    <p className="section-description">
                      Contact person to reach in case of an emergency.
                    </p>
                  </div>

                  {!editingEmergencyContact && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={
                        emergencyContact
                          ? handleEditEmergencyContact
                          : () => {
                              setError("");
                              setSuccess("");
                              setEditingEmergencyContact(true);
                            }
                      }
                    >
                      {emergencyContact
                        ? "Edit Contact"
                        : "+ Add Contact"}
                    </button>
                  )}

                </div>

                {emergencyContactLoading ? (

                  <div className="loading">
                    Loading emergency contact...
                  </div>

                ) : editingEmergencyContact ? (

                  <form
                    className="dependent-form"
                    onSubmit={
                      handleSaveEmergencyContact
                    }
                  >

                    <div className="patient-edit-grid">

                      <div className="form-group">

                        <label>
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={
                            emergencyContactForm.name
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Enter full name"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Relationship
                        </label>

                        <select
                          value={
                            emergencyContactForm.relationship
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "relationship",
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select relationship
                          </option>

                          <option value="SPOUSE">
                            Spouse
                          </option>

                          <option value="PARENT">
                            Parent
                          </option>

                          <option value="CHILD">
                            Child
                          </option>

                          <option value="SIBLING">
                            Sibling
                          </option>

                          <option value="FRIEND">
                            Friend
                          </option>

                          <option value="OTHER">
                            Other
                          </option>

                        </select>

                      </div>

                      <div className="form-group">

                        <label>
                          Phone
                        </label>

                        <input
                          type="tel"
                          value={
                            emergencyContactForm.phone
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="Enter phone number"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Alternate Phone
                        </label>

                        <input
                          type="tel"
                          value={
                            emergencyContactForm.alternatePhone
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "alternatePhone",
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Email
                        </label>

                        <input
                          type="email"
                          value={
                            emergencyContactForm.email
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                        />

                      </div>

                      <div className="form-group patient-address-field">

                        <label>
                          Address
                        </label>

                        <textarea
                          value={
                            emergencyContactForm.address
                          }
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "address",
                              e.target.value
                            )
                          }
                          placeholder="Enter address"
                          rows={3}
                        />

                      </div>

                    </div>

                    <div className="form-actions">

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          handleCancelEmergencyContactEdit
                        }
                        disabled={
                          savingEmergencyContact
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={
                          savingEmergencyContact
                        }
                      >
                        {savingEmergencyContact
                          ? "Saving..."
                          : "Save Contact"}
                      </button>

                    </div>

                  </form>

                ) : emergencyContact ? (

                  <div className="patient-details-grid">

                    <div className="patient-detail-item">

                      <span>
                        Full Name
                      </span>

                      <strong>
                        {getEmergencyContactName(emergencyContact)}
                      </strong>

                    </div>

                    <div className="patient-detail-item">

                      <span>
                        Relationship
                      </span>

                      <strong>
                        {emergencyContact.relationship}
                      </strong>

                    </div>

                    <div className="patient-detail-item">

                      <span>
                        Phone
                      </span>

                      <strong>
                        {emergencyContact.phone}
                      </strong>

                    </div>

                    <div className="patient-detail-item">

                      <span>
                        Alternate Phone
                      </span>

                      <strong>
                        {emergencyContact.alternatePhone ||
                          "-"}
                      </strong>

                    </div>

                    <div className="patient-detail-item">

                      <span>
                        Email
                      </span>

                      <strong>
                        {emergencyContact.email ||
                          "-"}
                      </strong>

                    </div>

                    <div className="patient-detail-item">

                      <span>
                        Address
                      </span>

                      <strong>
                        {emergencyContact.address ||
                          "-"}
                      </strong>

                    </div>

                    <div
                      className="patient-details-actions"
                      style={{
                        gridColumn: "1 / -1",
                        justifyContent: "flex-start",
                      }}
                    >

                      <button
                        type="button"
                        className="primary-button"
                        onClick={
                          handleEditEmergencyContact
                        }
                      >
                        Edit Contact
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={
                          handleDeleteEmergencyContact
                        }
                      >
                        Remove Contact
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="empty-state">
                    No emergency contact added.
                  </div>

                )}

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
                  Dependents
              ========================= */}

              <section className="patient-details-section">

                <div className="section-heading-row">

                  <div>

                    <h3>
                      Dependents
                    </h3>

                    <p className="section-description">
                      Manage family members and dependents
                      associated with this patient.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      setShowDependentForm(
                        !showDependentForm
                      )
                    }
                  >
                    {showDependentForm
                      ? "Cancel"
                      : "+ Add Dependent"}
                  </button>

                </div>

                {showDependentForm && (

                  <form
                    className="dependent-form"
                    onSubmit={
                      handleAddDependent
                    }
                  >

                    <div className="patient-edit-grid">

                      <div className="form-group">

                        <label>
                          First Name
                        </label>

                        <input
                          type="text"
                          value={
                            dependentForm.firstName
                          }
                          onChange={(e) =>
                            handleDependentChange(
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
                            dependentForm.lastName
                          }
                          onChange={(e) =>
                            handleDependentChange(
                              "lastName",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Relationship
                        </label>

                        <select
                          value={
                            dependentForm.relationship
                          }
                          onChange={(e) =>
                            handleDependentChange(
                              "relationship",
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select relationship
                          </option>

                          <option value="SPOUSE">
                            Spouse
                          </option>

                          <option value="CHILD">
                            Child
                          </option>

                          <option value="PARENT">
                            Parent
                          </option>

                          <option value="SIBLING">
                            Sibling
                          </option>

                          <option value="OTHER">
                            Other
                          </option>

                        </select>

                      </div>

                      <div className="form-group">

                        <label>
                          Date of Birth
                        </label>

                        <input
                          type="date"
                          value={
                            dependentForm.dateOfBirth
                          }
                          onChange={(e) =>
                            handleDependentChange(
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Gender
                        </label>

                        <select
                          value={
                            dependentForm.gender
                          }
                          onChange={(e) =>
                            handleDependentChange(
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
                          Phone
                        </label>

                        <input
                          type="text"
                          value={
                            dependentForm.phone
                          }
                          onChange={(e) =>
                            handleDependentChange(
                              "phone",
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
                            dependentForm.email
                          }
                          onChange={(e) =>
                            handleDependentChange(
                              "email",
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    <div className="form-actions">

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={
                          dependentLoading
                        }
                      >
                        {dependentLoading
                          ? "Adding..."
                          : "Add Dependent"}
                      </button>

                    </div>

                  </form>

                )}

                {dependents.length === 0 ? (

                  <div className="empty-state">
                    No dependents added.
                  </div>

                ) : (

                  <div className="dependents-list">

                    {dependents.map(
                      (dependent) => (

                        <div
                          className="dependent-card"
                          key={dependent.id}
                        >

                          <div className="dependent-avatar">

                            {dependent.firstName
                              .charAt(0)
                              .toUpperCase()}

                            {dependent.lastName
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="dependent-info">

                            <strong>
                              {dependent.firstName}{" "}
                              {dependent.lastName}
                            </strong>

                            <span>
                              {dependent.relationship}
                            </span>

                            {dependent.phone && (
                              <small>
                                {dependent.phone}
                              </small>
                            )}

                            {dependent.email && (
                              <small>
                                {dependent.email}
                              </small>
                            )}

                          </div>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleDeleteDependent(
                                dependent.id
                              )
                            }
                          >
                            Remove
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

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
                        View appointment history
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
                        View prescription history
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

                </div>

              </section>

              {/* =========================
                  Documents
              ========================= */}

              <section className="patient-details-section">

                <div className="section-heading-row">

                  <div>

                    <h3>
                      Documents
                    </h3>

                    <p className="section-description">
                      Upload and manage patient documents.
                    </p>

                  </div>

                </div>

                <div className="documents-upload-box">

                  <div className="document-upload-controls">

                    <select
                      value={documentType}
                      onChange={(e) =>
                        setDocumentType(
                          e.target.value
                        )
                      }
                      className="document-type-select"
                    >

                      <option value="MEDICAL_RECORD">
                        Medical Record
                      </option>

                      <option value="LAB_REPORT">
                        Lab Report
                      </option>

                      <option value="PRESCRIPTION">
                        Prescription
                      </option>

                      <option value="INSURANCE">
                        Insurance
                      </option>

                      <option value="IDENTIFICATION">
                        Identification
                      </option>

                      <option value="OTHER">
                        Other
                      </option>

                    </select>

                    <label className="primary-button upload-document-button">

                      {uploadingDocument
                        ? "Uploading..."
                        : "+ Upload Document"}

                      <input
                        type="file"
                        hidden
                        disabled={
                          uploadingDocument
                        }
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
                        onChange={
                          handleDocumentUpload
                        }
                      />

                    </label>

                  </div>

                  <p className="document-upload-help">
                    PDF, JPG, PNG, WEBP, DOC, DOCX or TXT.
                    Maximum size: 10 MB.
                  </p>

                </div>

                {documentLoading ? (

                  <div className="loading">
                    Loading documents...
                  </div>

                ) : documents.length === 0 ? (

                  <div className="empty-state">
                    No documents uploaded.
                  </div>

                ) : (

                  <div className="documents-list">

                    {documents.map(
                      (document) => (

                        <div
                          className="document-card"
                          key={document.id}
                        >

                          <div className="document-icon">
                            📄
                          </div>

                          <div className="document-info">

                            <strong>
                              {document.originalName}
                            </strong>

                            <span>
                              {document.documentType}
                            </span>

                            <small>
                              {formatFileSize(
                                document.size
                              )}{" "}
                              •{" "}
                              {new Date(
                                document.createdAt
                              ).toLocaleDateString()}
                            </small>

                          </div>

                          <div className="document-actions">

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                handleDocumentDownload(
                                  document.id,
                                  document.originalName
                                )
                              }
                            >
                              Download
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              onClick={() =>
                                handleDocumentDelete(
                                  document.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

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
                      disabled={
                        deactivating
                      }
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