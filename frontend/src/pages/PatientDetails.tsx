import { useEffect, useRef, useState } from "react";
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
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
}

const emptyDependentForm = {
  firstName: "",
  lastName: "",
  relationship: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
};

interface EmergencyContact {
  id: number;
  patientId: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  address?: string | null;
}

const emptyEmergencyContactForm = {
  firstName: "",
  lastName: "",
  relationship: "",
  phone: "",
  alternatePhone: "",
  email: "",
  address: "",
};

interface MedicalProfile {
  id: number;
  patientId: number;
  medicalConditions?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
  medicalNotes?: string | null;
}

const emptyMedicalProfileForm = {
  medicalConditions: "",
  allergies: "",
  currentMedications: "",
  medicalNotes: "",
};

interface PatientDocument {
  id: number;
  originalName: string;
  documentType: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt?: string;
}

const DOCUMENT_TYPE_OPTIONS = [
  "ID Proof",
  "Lab Report",
  "Prescription Scan",
  "Insurance",
  "Consent Form",
  "Other",
];

const DOCUMENT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

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

  const [dependents, setDependents] =
    useState<Dependent[]>([]);

  const [dependentsLoading, setDependentsLoading] =
    useState(false);

  const [dependentsSaving, setDependentsSaving] =
    useState(false);

  const [deletingDependentId, setDeletingDependentId] =
    useState<number | null>(null);

  const [showDependentForm, setShowDependentForm] =
    useState(false);

  const [dependentForm, setDependentForm] =
    useState(emptyDependentForm);

  const [dependentsError, setDependentsError] =
    useState("");

  const [dependentsSuccess, setDependentsSuccess] =
    useState("");

  const [emergencyContact, setEmergencyContact] =
    useState<EmergencyContact | null>(null);

  const [emergencyContactLoading, setEmergencyContactLoading] =
    useState(false);

  const [emergencyContactSaving, setEmergencyContactSaving] =
    useState(false);

  const [emergencyContactDeleting, setEmergencyContactDeleting] =
    useState(false);

  const [showEmergencyContactForm, setShowEmergencyContactForm] =
    useState(false);

  const [emergencyContactForm, setEmergencyContactForm] =
    useState(emptyEmergencyContactForm);

  const [emergencyContactError, setEmergencyContactError] =
    useState("");

  const [emergencyContactSuccess, setEmergencyContactSuccess] =
    useState("");

  const [medicalProfile, setMedicalProfile] =
    useState<MedicalProfile | null>(null);

  const [medicalProfileLoading, setMedicalProfileLoading] =
    useState(false);

  const [medicalProfileSaving, setMedicalProfileSaving] =
    useState(false);

  const [showMedicalProfileForm, setShowMedicalProfileForm] =
    useState(false);

  const [medicalProfileForm, setMedicalProfileForm] =
    useState(emptyMedicalProfileForm);

  const [medicalProfileError, setMedicalProfileError] =
    useState("");

  const [medicalProfileSuccess, setMedicalProfileSuccess] =
    useState("");

  const [documents, setDocuments] =
    useState<PatientDocument[]>([]);

  const [documentsLoading, setDocumentsLoading] =
    useState(false);

  const [documentUploading, setDocumentUploading] =
    useState(false);

  const [deletingDocumentId, setDeletingDocumentId] =
    useState<number | null>(null);

  const [downloadingDocumentId, setDownloadingDocumentId] =
    useState<number | null>(null);

  const [documentType, setDocumentType] =
    useState("");

  const [selectedDocumentFile, setSelectedDocumentFile] =
    useState<File | null>(null);

  const [documentsError, setDocumentsError] =
    useState("");

  const [documentsSuccess, setDocumentsSuccess] =
    useState("");

  const documentFileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchPatient();
    fetchDependents();
    fetchEmergencyContact();
    fetchMedicalProfile();
    fetchDocuments();
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

  const fetchDependents = async () => {
    if (!id) {
      return;
    }

    try {
      setDependentsLoading(true);
      setDependentsError("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents`,
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
            "Failed to fetch dependents"
        );
      }

      setDependents(result.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch dependents:",
        error
      );

      setDependentsError(
        error instanceof Error
          ? error.message
          : "Failed to fetch dependents"
      );
    } finally {
      setDependentsLoading(false);
    }
  };

  const handleDependentFormChange = (
    field: keyof typeof emptyDependentForm,
    value: string
  ) => {
    setDependentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetDependentForm = () => {
    setDependentForm(emptyDependentForm);
    setShowDependentForm(false);
  };

  const handleAddDependent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    const firstName =
      dependentForm.firstName.trim();
    const lastName =
      dependentForm.lastName.trim();
    const relationship =
      dependentForm.relationship.trim();

    if (!firstName || !lastName || !relationship) {
      setDependentsError(
        "First name, last name and relationship are required"
      );
      setDependentsSuccess("");
      return;
    }

    try {
      setDependentsSaving(true);
      setDependentsError("");
      setDependentsSuccess("");

      const payload: {
        firstName: string;
        lastName: string;
        relationship: string;
        dateOfBirth?: string;
        gender?: string;
        phone?: string;
        email?: string;
      } = {
        firstName,
        lastName,
        relationship,
      };

      if (dependentForm.dateOfBirth) {
        payload.dateOfBirth =
          dependentForm.dateOfBirth;
      }

      if (dependentForm.gender) {
        payload.gender =
          dependentForm.gender;
      }

      if (dependentForm.phone.trim()) {
        payload.phone =
          dependentForm.phone.trim();
      }

      if (dependentForm.email.trim()) {
        payload.email =
          dependentForm.email.trim();
      }

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to add dependent"
        );
      }

      setDependentsSuccess(
        result.message ||
          "Dependent added successfully"
      );

      resetDependentForm();
      await fetchDependents();
    } catch (error) {
      console.error(
        "Failed to add dependent:",
        error
      );

      setDependentsError(
        error instanceof Error
          ? error.message
          : "Failed to add dependent"
      );
    } finally {
      setDependentsSaving(false);
    }
  };

  const handleDeleteDependent = async (
    dependent: Dependent
  ) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${dependent.firstName} ${dependent.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDependentId(dependent.id);
      setDependentsError("");
      setDependentsSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/dependents/${dependent.id}`,
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
            "Failed to remove dependent"
        );
      }

      setDependentsSuccess(
        result.message ||
          "Dependent removed successfully"
      );

      await fetchDependents();
    } catch (error) {
      console.error(
        "Failed to remove dependent:",
        error
      );

      setDependentsError(
        error instanceof Error
          ? error.message
          : "Failed to remove dependent"
      );
    } finally {
      setDeletingDependentId(null);
    }
  };

  const fetchEmergencyContact = async () => {
    if (!id) {
      return;
    }

    try {
      setEmergencyContactLoading(true);
      setEmergencyContactError("");

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

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch emergency contact"
        );
      }

      setEmergencyContact(result.data || null);
    } catch (error) {
      console.error(
        "Failed to fetch emergency contact:",
        error
      );

      setEmergencyContactError(
        error instanceof Error
          ? error.message
          : "Failed to fetch emergency contact"
      );
    } finally {
      setEmergencyContactLoading(false);
    }
  };

  const handleEmergencyContactFormChange = (
    field: keyof typeof emptyEmergencyContactForm,
    value: string
  ) => {
    setEmergencyContactForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const populateEmergencyContactForm = (
    contact: EmergencyContact
  ) => {
    setEmergencyContactForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      relationship: contact.relationship || "",
      phone: contact.phone || "",
      alternatePhone: contact.alternatePhone || "",
      email: contact.email || "",
      address: contact.address || "",
    });
  };

  const resetEmergencyContactForm = () => {
    setEmergencyContactForm(emptyEmergencyContactForm);
    setShowEmergencyContactForm(false);
  };

  const handleStartAddEmergencyContact = () => {
    setEmergencyContactError("");
    setEmergencyContactSuccess("");
    setEmergencyContactForm(emptyEmergencyContactForm);
    setShowEmergencyContactForm(true);
  };

  const handleStartEditEmergencyContact = () => {
    if (!emergencyContact) {
      return;
    }

    setEmergencyContactError("");
    setEmergencyContactSuccess("");
    populateEmergencyContactForm(emergencyContact);
    setShowEmergencyContactForm(true);
  };

  const handleCancelEmergencyContactForm = () => {
    resetEmergencyContactForm();
    setEmergencyContactError("");
  };

  const handleSaveEmergencyContact = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    const firstName =
      emergencyContactForm.firstName.trim();
    const lastName =
      emergencyContactForm.lastName.trim();
    const relationship =
      emergencyContactForm.relationship.trim();
    const phone =
      emergencyContactForm.phone.trim();

    if (
      !firstName ||
      !lastName ||
      !relationship ||
      !phone
    ) {
      setEmergencyContactError(
        "First name, last name, relationship and phone are required"
      );
      setEmergencyContactSuccess("");
      return;
    }

    try {
      setEmergencyContactSaving(true);
      setEmergencyContactError("");
      setEmergencyContactSuccess("");

      const payload: {
        firstName: string;
        lastName: string;
        relationship: string;
        phone: string;
        alternatePhone?: string;
        email?: string;
        address?: string;
      } = {
        firstName,
        lastName,
        relationship,
        phone,
      };

      if (emergencyContactForm.alternatePhone.trim()) {
        payload.alternatePhone =
          emergencyContactForm.alternatePhone.trim();
      }

      if (emergencyContactForm.email.trim()) {
        payload.email =
          emergencyContactForm.email.trim();
      }

      if (emergencyContactForm.address.trim()) {
        payload.address =
          emergencyContactForm.address.trim();
      }

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/emergency-contact`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save emergency contact"
        );
      }

      setEmergencyContact(result.data || null);
      setEmergencyContactSuccess(
        result.message ||
          "Emergency contact saved successfully"
      );
      resetEmergencyContactForm();
    } catch (error) {
      console.error(
        "Failed to save emergency contact:",
        error
      );

      setEmergencyContactError(
        error instanceof Error
          ? error.message
          : "Failed to save emergency contact"
      );
    } finally {
      setEmergencyContactSaving(false);
    }
  };

  const handleDeleteEmergencyContact = async () => {
    if (!id || !emergencyContact) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the emergency contact for ${emergencyContact.firstName} ${emergencyContact.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setEmergencyContactDeleting(true);
      setEmergencyContactError("");
      setEmergencyContactSuccess("");

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
            "Failed to delete emergency contact"
        );
      }

      setEmergencyContact(null);
      resetEmergencyContactForm();
      setEmergencyContactSuccess(
        result.message ||
          "Emergency contact deleted successfully"
      );
    } catch (error) {
      console.error(
        "Failed to delete emergency contact:",
        error
      );

      setEmergencyContactError(
        error instanceof Error
          ? error.message
          : "Failed to delete emergency contact"
      );
    } finally {
      setEmergencyContactDeleting(false);
    }
  };

  const fetchMedicalProfile = async () => {
    if (!id) {
      return;
    }

    try {
      setMedicalProfileLoading(true);
      setMedicalProfileError("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/medical-profile`,
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
            "Failed to fetch medical profile"
        );
      }

      setMedicalProfile(result.data || null);
    } catch (error) {
      console.error(
        "Failed to fetch medical profile:",
        error
      );

      setMedicalProfileError(
        error instanceof Error
          ? error.message
          : "Failed to fetch medical profile"
      );
    } finally {
      setMedicalProfileLoading(false);
    }
  };

  const handleMedicalProfileFormChange = (
    field: keyof typeof emptyMedicalProfileForm,
    value: string
  ) => {
    setMedicalProfileForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const populateMedicalProfileForm = (
    profile: MedicalProfile
  ) => {
    setMedicalProfileForm({
      medicalConditions:
        profile.medicalConditions || "",
      allergies: profile.allergies || "",
      currentMedications:
        profile.currentMedications || "",
      medicalNotes: profile.medicalNotes || "",
    });
  };

  const resetMedicalProfileForm = () => {
    setMedicalProfileForm(emptyMedicalProfileForm);
    setShowMedicalProfileForm(false);
  };

  const handleStartAddMedicalProfile = () => {
    setMedicalProfileError("");
    setMedicalProfileSuccess("");
    setMedicalProfileForm(emptyMedicalProfileForm);
    setShowMedicalProfileForm(true);
  };

  const handleStartEditMedicalProfile = () => {
    if (!medicalProfile) {
      return;
    }

    setMedicalProfileError("");
    setMedicalProfileSuccess("");
    populateMedicalProfileForm(medicalProfile);
    setShowMedicalProfileForm(true);
  };

  const handleCancelMedicalProfileForm = () => {
    resetMedicalProfileForm();
    setMedicalProfileError("");
  };

  const handleSaveMedicalProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    const medicalConditions =
      medicalProfileForm.medicalConditions.trim();
    const allergies =
      medicalProfileForm.allergies.trim();
    const currentMedications =
      medicalProfileForm.currentMedications.trim();
    const medicalNotes =
      medicalProfileForm.medicalNotes.trim();

    if (
      !medicalConditions &&
      !allergies &&
      !currentMedications &&
      !medicalNotes
    ) {
      setMedicalProfileError(
        "Enter at least one medical profile field before saving"
      );
      setMedicalProfileSuccess("");
      return;
    }

    try {
      setMedicalProfileSaving(true);
      setMedicalProfileError("");
      setMedicalProfileSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/medical-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicalConditions,
            allergies,
            currentMedications,
            medicalNotes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save medical profile"
        );
      }

      setMedicalProfile(result.data || null);
      setMedicalProfileSuccess(
        result.message ||
          "Medical profile saved successfully"
      );
      resetMedicalProfileForm();
    } catch (error) {
      console.error(
        "Failed to save medical profile:",
        error
      );

      setMedicalProfileError(
        error instanceof Error
          ? error.message
          : "Failed to save medical profile"
      );
    } finally {
      setMedicalProfileSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const scrollToDocumentsSection = () => {
    const section = document.getElementById(
      "patient-documents"
    );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const parseResponseMessage = async (
    response: Response,
    fallback: string
  ) => {
    try {
      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const result = await response.json();

        if (result?.message) {
          return String(result.message);
        }
      }
    } catch {
      // Fall through to fallback message.
    }

    return fallback;
  };

  const fetchDocuments = async () => {
    if (!id) {
      return;
    }

    try {
      setDocumentsLoading(true);
      setDocumentsError("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch documents"
        );
      }

      setDocuments(result.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch documents:",
        error
      );

      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Failed to fetch documents"
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  const resetDocumentUploadForm = () => {
    setDocumentType("");
    setSelectedDocumentFile(null);

    if (documentFileInputRef.current) {
      documentFileInputRef.current.value = "";
    }
  };

  const handleUploadDocument = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    if (!documentType.trim()) {
      setDocumentsError(
        "Document type is required"
      );
      setDocumentsSuccess("");
      return;
    }

    if (!selectedDocumentFile) {
      setDocumentsError(
        "Document file is required"
      );
      setDocumentsSuccess("");
      return;
    }

    if (
      selectedDocumentFile.size >
      MAX_DOCUMENT_SIZE_BYTES
    ) {
      setDocumentsError(
        "File size must be 10MB or less"
      );
      setDocumentsSuccess("");
      return;
    }

    try {
      setDocumentUploading(true);
      setDocumentsError("");
      setDocumentsSuccess("");

      const formDataPayload = new FormData();
      formDataPayload.append(
        "document",
        selectedDocumentFile
      );
      formDataPayload.append(
        "documentType",
        documentType.trim()
      );

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formDataPayload,
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseResponseMessage(
            response,
            "Failed to upload document"
          )
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to upload document"
        );
      }

      setDocumentsSuccess(
        result.message ||
          "Document uploaded successfully"
      );
      resetDocumentUploadForm();
      await fetchDocuments();
    } catch (error) {
      console.error(
        "Failed to upload document:",
        error
      );

      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Failed to upload document"
      );
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleDownloadDocument = async (
    docItem: PatientDocument
  ) => {
    if (!id) {
      return;
    }

    try {
      setDownloadingDocumentId(docItem.id);
      setDocumentsError("");
      setDocumentsSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents/${docItem.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseResponseMessage(
            response,
            "Failed to download document"
          )
        );
      }

      const blob = await response.blob();
      const objectUrl =
        window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = docItem.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setDocumentsSuccess(
        `Downloaded ${docItem.originalName}`
      );
    } catch (error) {
      console.error(
        "Failed to download document:",
        error
      );

      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Failed to download document"
      );
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handleDeleteDocument = async (
    docItem: PatientDocument
  ) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${docItem.originalName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDocumentId(docItem.id);
      setDocumentsError("");
      setDocumentsSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/patients/${id}/documents/${docItem.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseResponseMessage(
            response,
            "Failed to delete document"
          )
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to delete document"
        );
      }

      setDocumentsSuccess(
        result.message ||
          "Document deleted successfully"
      );
      await fetchDocuments();
    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      );

      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Failed to delete document"
      );
    } finally {
      setDeletingDocumentId(null);
    }
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
                  Dependents
              ========================= */}

              <section className="patient-details-section">

                <div className="section-heading-row">

                  <div>

                    <h3>
                      Dependents
                    </h3>

                    <p className="section-description">
                      View and manage family
                      members linked to this
                      patient.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setDependentsError("");
                      setDependentsSuccess("");
                      setShowDependentForm(
                        (previous) => {
                          if (previous) {
                            setDependentForm(
                              emptyDependentForm
                            );
                          }
                          return !previous;
                        }
                      );
                    }}
                  >
                    {showDependentForm
                      ? "Cancel"
                      : "+ Add Dependent"}
                  </button>

                </div>

                {dependentsError && (
                  <div
                    className="auth-error"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {dependentsError}
                  </div>
                )}

                {dependentsSuccess && (
                  <div
                    className="auth-success"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {dependentsSuccess}
                  </div>
                )}

                {showDependentForm && (
                  <form
                    className="dependent-form"
                    onSubmit={handleAddDependent}
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
                            handleDependentFormChange(
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
                            handleDependentFormChange(
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
                        <input
                          type="text"
                          placeholder="e.g. Spouse, Child, Parent"
                          value={
                            dependentForm.relationship
                          }
                          onChange={(e) =>
                            handleDependentFormChange(
                              "relationship",
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
                            dependentForm.dateOfBirth
                          }
                          onChange={(e) =>
                            handleDependentFormChange(
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
                            handleDependentFormChange(
                              "gender",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select gender
                          </option>
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
                            handleDependentFormChange(
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
                            handleDependentFormChange(
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="patient-details-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setDependentForm(
                            emptyDependentForm
                          );
                          setShowDependentForm(
                            false
                          );
                          setDependentsError("");
                        }}
                        disabled={dependentsSaving}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={dependentsSaving}
                      >
                        {dependentsSaving
                          ? "Saving..."
                          : "Add Dependent"}
                      </button>
                    </div>

                  </form>
                )}

                {dependentsLoading ? (
                  <div className="loading">
                    Loading dependents...
                  </div>
                ) : dependents.length === 0 ? (
                  <div className="empty-state">
                    No dependents found for this
                    patient.
                  </div>
                ) : (
                  <div className="dependents-list">
                    {dependents.map(
                      (dependent) => (
                        <div
                          key={dependent.id}
                          className="dependent-card"
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

                            <small>
                              {[
                                dependent.dateOfBirth
                                  ? `DOB: ${formatDate(dependent.dateOfBirth)}`
                                  : null,
                                dependent.gender ||
                                  null,
                                dependent.phone ||
                                  null,
                                dependent.email ||
                                  null,
                              ]
                                .filter(Boolean)
                                .join(" · ") ||
                                "No additional details"}
                            </small>
                          </div>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleDeleteDependent(
                                dependent
                              )
                            }
                            disabled={
                              deletingDependentId ===
                              dependent.id
                            }
                          >
                            {deletingDependentId ===
                            dependent.id
                              ? "Removing..."
                              : "Remove"}
                          </button>

                        </div>
                      )
                    )}
                  </div>
                )}

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
                      Primary contact to reach in
                      case of emergency.
                    </p>

                  </div>

                  {!emergencyContactLoading &&
                    !showEmergencyContactForm && (
                      emergencyContact ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={
                            handleStartEditEmergencyContact
                          }
                        >
                          Edit Contact
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={
                            handleStartAddEmergencyContact
                          }
                        >
                          + Add Emergency Contact
                        </button>
                      )
                    )}

                  {showEmergencyContactForm && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        handleCancelEmergencyContactForm
                      }
                      disabled={
                        emergencyContactSaving
                      }
                    >
                      Cancel
                    </button>
                  )}

                </div>

                {emergencyContactError && (
                  <div
                    className="auth-error"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {emergencyContactError}
                  </div>
                )}

                {emergencyContactSuccess && (
                  <div
                    className="auth-success"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {emergencyContactSuccess}
                  </div>
                )}

                {showEmergencyContactForm && (
                  <form
                    className="dependent-form"
                    onSubmit={
                      handleSaveEmergencyContact
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
                            emergencyContactForm.firstName
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
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
                            emergencyContactForm.lastName
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
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
                        <input
                          type="text"
                          placeholder="e.g. Spouse, Parent, Sibling"
                          value={
                            emergencyContactForm.relationship
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
                              "relationship",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Phone
                        </label>
                        <input
                          type="text"
                          value={
                            emergencyContactForm.phone
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
                              "phone",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Alternate Phone
                        </label>
                        <input
                          type="text"
                          value={
                            emergencyContactForm.alternatePhone
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
                              "alternatePhone",
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
                            emergencyContactForm.email
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Address
                        </label>
                        <textarea
                          rows={3}
                          value={
                            emergencyContactForm.address
                          }
                          onChange={(e) =>
                            handleEmergencyContactFormChange(
                              "address",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="patient-details-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          handleCancelEmergencyContactForm
                        }
                        disabled={
                          emergencyContactSaving
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={
                          emergencyContactSaving
                        }
                      >
                        {emergencyContactSaving
                          ? "Saving..."
                          : emergencyContact
                            ? "Update Contact"
                            : "Save Contact"}
                      </button>
                    </div>

                  </form>
                )}

                {!showEmergencyContactForm && (
                  emergencyContactLoading ? (
                    <div className="loading">
                      Loading emergency contact...
                    </div>
                  ) : emergencyContact ? (
                    <div className="dependents-list">
                      <div className="dependent-card">

                        <div className="dependent-avatar">
                          {emergencyContact.firstName
                            .charAt(0)
                            .toUpperCase()}
                          {emergencyContact.lastName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="dependent-info">
                          <strong>
                            {emergencyContact.firstName}{" "}
                            {emergencyContact.lastName}
                          </strong>

                          <span>
                            {emergencyContact.relationship}
                          </span>

                          <small>
                            {[
                              `Phone: ${emergencyContact.phone}`,
                              emergencyContact.alternatePhone
                                ? `Alt: ${emergencyContact.alternatePhone}`
                                : null,
                              emergencyContact.email ||
                                null,
                              emergencyContact.address ||
                                null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={
                            handleDeleteEmergencyContact
                          }
                          disabled={
                            emergencyContactDeleting
                          }
                        >
                          {emergencyContactDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      No emergency contact on file
                      for this patient.
                    </div>
                  )
                )}

              </section>

              {/* =========================
                  Medical Profile
              ========================= */}

              <section className="patient-details-section">

                <div className="section-heading-row">

                  <div>

                    <h3>
                      Medical Profile
                    </h3>

                    <p className="section-description">
                      Conditions, allergies,
                      medications, and clinical
                      notes for this patient.
                    </p>

                  </div>

                  {!medicalProfileLoading &&
                    !showMedicalProfileForm && (
                      medicalProfile ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={
                            handleStartEditMedicalProfile
                          }
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={
                            handleStartAddMedicalProfile
                          }
                        >
                          + Add Medical Profile
                        </button>
                      )
                    )}

                  {showMedicalProfileForm && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        handleCancelMedicalProfileForm
                      }
                      disabled={
                        medicalProfileSaving
                      }
                    >
                      Cancel
                    </button>
                  )}

                </div>

                {medicalProfileError && (
                  <div
                    className="auth-error"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {medicalProfileError}
                  </div>
                )}

                {medicalProfileSuccess && (
                  <div
                    className="auth-success"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {medicalProfileSuccess}
                  </div>
                )}

                {showMedicalProfileForm && (
                  <form
                    className="dependent-form"
                    onSubmit={
                      handleSaveMedicalProfile
                    }
                  >

                    <div className="patient-edit-grid">

                      <div className="form-group">
                        <label>
                          Medical Conditions
                        </label>
                        <textarea
                          rows={3}
                          value={
                            medicalProfileForm.medicalConditions
                          }
                          onChange={(e) =>
                            handleMedicalProfileFormChange(
                              "medicalConditions",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Allergies
                        </label>
                        <textarea
                          rows={3}
                          value={
                            medicalProfileForm.allergies
                          }
                          onChange={(e) =>
                            handleMedicalProfileFormChange(
                              "allergies",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Current Medications
                        </label>
                        <textarea
                          rows={3}
                          value={
                            medicalProfileForm.currentMedications
                          }
                          onChange={(e) =>
                            handleMedicalProfileFormChange(
                              "currentMedications",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Medical Notes
                        </label>
                        <textarea
                          rows={3}
                          value={
                            medicalProfileForm.medicalNotes
                          }
                          onChange={(e) =>
                            handleMedicalProfileFormChange(
                              "medicalNotes",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="patient-details-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          handleCancelMedicalProfileForm
                        }
                        disabled={
                          medicalProfileSaving
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={
                          medicalProfileSaving
                        }
                      >
                        {medicalProfileSaving
                          ? "Saving..."
                          : medicalProfile
                            ? "Update Profile"
                            : "Save Profile"}
                      </button>
                    </div>

                  </form>
                )}

                {!showMedicalProfileForm && (
                  medicalProfileLoading ? (
                    <div className="loading">
                      Loading medical profile...
                    </div>
                  ) : medicalProfile ? (
                    <div className="patient-details-grid">

                      <div className="patient-detail-item">
                        <span>
                          Medical Conditions
                        </span>
                        <strong>
                          {medicalProfile.medicalConditions ||
                            "—"}
                        </strong>
                      </div>

                      <div className="patient-detail-item">
                        <span>
                          Allergies
                        </span>
                        <strong>
                          {medicalProfile.allergies ||
                            "—"}
                        </strong>
                      </div>

                      <div className="patient-detail-item">
                        <span>
                          Current Medications
                        </span>
                        <strong>
                          {medicalProfile.currentMedications ||
                            "—"}
                        </strong>
                      </div>

                      <div className="patient-detail-item">
                        <span>
                          Medical Notes
                        </span>
                        <strong>
                          {medicalProfile.medicalNotes ||
                            "—"}
                        </strong>
                      </div>

                    </div>
                  ) : (
                    <div className="empty-state">
                      No medical profile on file
                      for this patient.
                    </div>
                  )
                )}

              </section>

              {/* =========================
                  Documents
              ========================= */}

              <section
                id="patient-documents"
                className="patient-details-section"
              >

                <div className="section-heading-row">

                  <div>

                    <h3>
                      Documents
                    </h3>

                    <p className="section-description">
                      Upload, download, and manage
                      patient documents.
                    </p>

                  </div>

                </div>

                {documentsError && (
                  <div
                    className="auth-error"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {documentsError}
                  </div>
                )}

                {documentsSuccess && (
                  <div
                    className="auth-success"
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {documentsSuccess}
                  </div>
                )}

                <form
                  className="documents-upload-box"
                  onSubmit={handleUploadDocument}
                >

                  <div className="document-upload-controls">

                    <select
                      className="document-type-select"
                      value={documentType}
                      onChange={(e) =>
                        setDocumentType(
                          e.target.value
                        )
                      }
                      disabled={documentUploading}
                    >
                      <option value="">
                        Select document type
                      </option>

                      {DOCUMENT_TYPE_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>

                    <input
                      ref={documentFileInputRef}
                      type="file"
                      accept={DOCUMENT_ACCEPT}
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0] ||
                          null;
                        setSelectedDocumentFile(
                          file
                        );
                        setDocumentsError("");
                      }}
                      disabled={documentUploading}
                    />

                    <button
                      type="submit"
                      className="primary-button upload-document-button"
                      disabled={documentUploading}
                    >
                      {documentUploading
                        ? "Uploading..."
                        : "Upload Document"}
                    </button>

                  </div>

                  <p className="document-upload-help">
                    Allowed: PDF, JPG, PNG, WEBP,
                    TXT, DOC, DOCX. Max size 10MB.
                    {selectedDocumentFile
                      ? ` Selected: ${selectedDocumentFile.name}`
                      : ""}
                  </p>

                </form>

                {documentsLoading ? (
                  <div className="loading">
                    Loading documents...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="empty-state">
                    No documents uploaded for this
                    patient.
                  </div>
                ) : (
                  <div className="documents-list">
                    {documents.map((docItem) => (
                      <div
                        key={docItem.id}
                        className="document-card"
                      >

                        <div className="document-icon">
                          📄
                        </div>

                        <div className="document-info">
                          <strong>
                            {docItem.originalName}
                          </strong>

                          <span>
                            {docItem.documentType}
                          </span>

                          <small>
                            {formatFileSize(
                              docItem.size
                            )}
                            {" · "}
                            {formatDate(
                              docItem.createdAt
                            )}
                          </small>
                        </div>

                        <div className="document-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleDownloadDocument(
                                docItem
                              )
                            }
                            disabled={
                              downloadingDocumentId ===
                                docItem.id ||
                              deletingDocumentId ===
                                docItem.id
                            }
                          >
                            {downloadingDocumentId ===
                            docItem.id
                              ? "Downloading..."
                              : "Download"}
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleDeleteDocument(
                                docItem
                              )
                            }
                            disabled={
                              deletingDocumentId ===
                                docItem.id ||
                              downloadingDocumentId ===
                                docItem.id
                            }
                          >
                            {deletingDocumentId ===
                            docItem.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>

                      </div>
                    ))}
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

                  <div
                    className="patient-history-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(
                        `/appointments?patientId=${patient.id}`
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          "Enter" ||
                        e.key === " "
                      ) {
                        navigate(
                          `/appointments?patientId=${patient.id}`
                        );
                      }
                    }}
                  >
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

                  <div
                    className="patient-history-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(
                        `/patients/${patient.id}/prescriptions`
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          "Enter" ||
                        e.key === " "
                      ) {
                        navigate(
                          `/patients/${patient.id}/prescriptions`
                        );
                      }
                    }}
                  >
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

                  {isAdmin && (
                    <div
                      className="patient-history-card"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/patients/${patient.id}/orders`
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                            "Enter" ||
                          e.key === " "
                        ) {
                          navigate(
                            `/patients/${patient.id}/orders`
                          );
                        }
                      }}
                    >
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
                  )}

                  <div
                    className="patient-history-card"
                    role="button"
                    tabIndex={0}
                    onClick={
                      scrollToDocumentsSection
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          "Enter" ||
                        e.key === " "
                      ) {
                        scrollToDocumentsSection();
                      }
                    }}
                  >
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