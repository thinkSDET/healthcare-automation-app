/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
}

interface Dependent {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phone?: string | null;
}

interface EmergencyContact {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface MedicalProfile {
  medicalConditions?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
  medicalNotes?: string | null;
}

interface PatientDocument {
  id: number;
  originalName: string;
  documentType: string;
  size: number;
  createdAt: string;
}

function MyPatientProfile() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const patientId = user?.patientId;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [emergencyContact, setEmergencyContact] =
    useState<EmergencyContact | null>(null);
  const [medicalProfile, setMedicalProfile] =
    useState<MedicalProfile | null>(null);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bloodGroup: "",
  });

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadProfile = async () => {
    if (!patientId) {
      setLoading(false);
      setError(
        "No patient record is linked to this account."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        patientRes,
        dependentsRes,
        emergencyRes,
        medicalRes,
        documentsRes,
      ] = await Promise.all([
        fetch(
          `http://localhost:4000/api/patients/${patientId}`,
          { headers: authHeaders() }
        ),
        fetch(
          `http://localhost:4000/api/patients/${patientId}/dependents`,
          { headers: authHeaders() }
        ),
        fetch(
          `http://localhost:4000/api/patients/${patientId}/emergency-contact`,
          { headers: authHeaders() }
        ),
        fetch(
          `http://localhost:4000/api/patients/${patientId}/medical-profile`,
          { headers: authHeaders() }
        ),
        fetch(
          `http://localhost:4000/api/patients/${patientId}/documents`,
          { headers: authHeaders() }
        ),
      ]);

      const patientResult = await patientRes.json();
      if (!patientRes.ok || !patientResult.success) {
        throw new Error(
          patientResult.message ||
            "Failed to load your patient profile"
        );
      }

      const data = patientResult.data as Patient;
      setPatient(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        bloodGroup: data.bloodGroup || "",
      });

      const dependentsResult = await dependentsRes.json();
      if (dependentsRes.ok && dependentsResult.success) {
        setDependents(dependentsResult.data || []);
      }

      const emergencyResult = await emergencyRes.json();
      if (emergencyRes.ok && emergencyResult.success) {
        setEmergencyContact(emergencyResult.data || null);
      }

      const medicalResult = await medicalRes.json();
      if (medicalRes.ok && medicalResult.success) {
        setMedicalProfile(medicalResult.data || null);
      }

      const documentsResult = await documentsRes.json();
      if (documentsRes.ok && documentsResult.success) {
        setDocuments(documentsResult.data || []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [patientId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${patientId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update profile"
        );
      }

      setPatient(result.data);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (docItem: PatientDocument) => {
    if (!patientId) {
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/patients/${patientId}/documents/${docItem.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = docItem.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download document"
      );
    }
  };

  if (loading) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">Loading your profile...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your patient information.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card patient-details-card">
          {error && (
            <div className="auth-error" style={{ margin: "20px 30px 0" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-success" style={{ margin: "20px 30px 0" }}>
              {success}
            </div>
          )}

          {!patient ? (
            <div className="empty-state">
              No patient record is linked to this account.
            </div>
          ) : (
            <>
              <section className="patient-details-section">
                <div className="section-heading-row">
                  <div>
                    <h3>Personal Information</h3>
                    <p className="section-description">
                      Medical ID: {patient.medicalId}
                    </p>
                  </div>
                  {!editing && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSave}>
                    <div className="patient-edit-grid">
                      {(
                        [
                          ["firstName", "First Name"],
                          ["lastName", "Last Name"],
                          ["email", "Email"],
                          ["phone", "Phone"],
                          ["bloodGroup", "Blood Group"],
                        ] as const
                      ).map(([field, label]) => (
                        <div className="form-group" key={field}>
                          <label>{label}</label>
                          <input
                            type="text"
                            value={formData[field]}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            required={
                              field === "firstName" ||
                              field === "lastName" ||
                              field === "phone"
                            }
                          />
                        </div>
                      ))}
                      <div className="form-group">
                        <label>Address</label>
                        <textarea
                          rows={3}
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="patient-details-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setEditing(false);
                          setError("");
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
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="patient-details-grid">
                    <div className="patient-detail-item">
                      <span>Name</span>
                      <strong>
                        {patient.firstName} {patient.lastName}
                      </strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Date of Birth</span>
                      <strong>
                        {new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Gender</span>
                      <strong>{patient.gender}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Phone</span>
                      <strong>{patient.phone}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Email</span>
                      <strong>{patient.email || "—"}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Blood Group</span>
                      <strong>{patient.bloodGroup || "—"}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Address</span>
                      <strong>{patient.address || "—"}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Status</span>
                      <strong>{patient.status}</strong>
                    </div>
                  </div>
                )}
              </section>

              <section className="patient-details-section">
                <h3>Dependents</h3>
                {dependents.length === 0 ? (
                  <div className="empty-state">No dependents on file.</div>
                ) : (
                  <div className="dependents-list">
                    {dependents.map((dependent) => (
                      <div key={dependent.id} className="dependent-card">
                        <div className="dependent-info">
                          <strong>
                            {dependent.firstName} {dependent.lastName}
                          </strong>
                          <span>{dependent.relationship}</span>
                          <small>{dependent.phone || "No phone"}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="patient-details-section">
                <h3>Emergency Contact</h3>
                {!emergencyContact ? (
                  <div className="empty-state">
                    No emergency contact on file.
                  </div>
                ) : (
                  <div className="patient-details-grid">
                    <div className="patient-detail-item">
                      <span>Name</span>
                      <strong>
                        {emergencyContact.firstName}{" "}
                        {emergencyContact.lastName}
                      </strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Relationship</span>
                      <strong>{emergencyContact.relationship}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Phone</span>
                      <strong>{emergencyContact.phone}</strong>
                    </div>
                  </div>
                )}
              </section>

              <section className="patient-details-section">
                <h3>Medical Profile</h3>
                {!medicalProfile ? (
                  <div className="empty-state">
                    No medical profile on file.
                  </div>
                ) : (
                  <div className="patient-details-grid">
                    <div className="patient-detail-item">
                      <span>Conditions</span>
                      <strong>
                        {medicalProfile.medicalConditions || "—"}
                      </strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Allergies</span>
                      <strong>{medicalProfile.allergies || "—"}</strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Medications</span>
                      <strong>
                        {medicalProfile.currentMedications || "—"}
                      </strong>
                    </div>
                    <div className="patient-detail-item">
                      <span>Notes</span>
                      <strong>
                        {medicalProfile.medicalNotes || "—"}
                      </strong>
                    </div>
                  </div>
                )}
              </section>

              <section className="patient-details-section">
                <h3>Documents</h3>
                <p className="section-description">
                  Download only. Upload and delete are not available to
                  patients.
                </p>
                {documents.length === 0 ? (
                  <div className="empty-state">No documents on file.</div>
                ) : (
                  <div className="documents-list">
                    {documents.map((docItem) => (
                      <div key={docItem.id} className="document-card">
                        <div className="document-info">
                          <strong>{docItem.originalName}</strong>
                          <span>{docItem.documentType}</span>
                        </div>
                        <div className="document-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleDownload(docItem)}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyPatientProfile;
