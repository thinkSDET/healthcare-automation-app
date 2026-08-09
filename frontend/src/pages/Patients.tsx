import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  status: string;
}

function Patients() {
  const { token } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

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
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const currentToken = token || localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:4000/api/patients",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("Patients API response:", result);

      if (response.ok && result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const currentToken = token || localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:4000/api/patients",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      console.log("Create patient response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create patient"
        );
      }

      alert("Patient added successfully");

      setShowForm(false);

      setFormData({
        medicalId: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "MALE",
        email: "",
        phone: "",
        address: "",
        bloodGroup: "",
      });

      await fetchPatients();
    } catch (error) {
      console.error("Failed to create patient:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create patient"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="patients-page">

      <header className="patients-header">
        <div>
          <h1>Patients</h1>
          <p>Manage patient records and information.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Patient
        </button>
      </header>

      <main className="patients-content">

        {showForm && (
          <div className="patients-card patient-form-card">

            <div className="table-header">
              <h2>Add New Patient</h2>
            </div>

            <form onSubmit={handleAddPatient}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Medical ID</label>
                  <input
                    type="text"
                    placeholder="PAT-10002"
                    value={formData.medicalId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalId: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <input
                    type="text"
                    placeholder="O+"
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bloodGroup: e.target.value,
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Patient"}
                </button>

              </div>

            </form>
          </div>
        )}

        <div className="patients-card">

          <div className="table-header">
            <h2>Patient Records</h2>

            <input
              type="text"
              placeholder="Search patients..."
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              No patients found.
            </div>
          ) : (
            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>Medical ID</th>
                    <th>Patient</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {patients.map((patient) => (

                    <tr key={patient.id}>

                      <td>
                        {patient.medicalId}
                      </td>

                      <td>
                        <strong>
                          {patient.firstName}{" "}
                          {patient.lastName}
                        </strong>

                        <small>
                          {patient.email}
                        </small>
                      </td>

                      <td>
                        {new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {patient.gender}
                      </td>

                      <td>
                        {patient.phone}
                      </td>

                      <td>
                        <span className="status-badge">
                          {patient.status}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Patients;