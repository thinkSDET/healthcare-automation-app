/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ContextualBackLink from "../components/ContextualBackLink";

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address?: string;
  bloodGroup?: string;
  status: string;
  createdAt?: string;
}

type SortField =
  | "medicalId"
  | "firstName"
  | "dateOfBirth"
  | "gender"
  | "phone"
  | "status";

type SortDirection = "asc" | "desc";

function Patients() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Patient
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Sorting
  const [sortField, setSortField] =
    useState<SortField>("medicalId");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Selection
  const [showColumnMenu, setShowColumnMenu] =
    useState(false);

  const [visibleColumns, setVisibleColumns] =
    useState({
      medicalId: true,
      patient: true,
      dateOfBirth: true,
      gender: true,
      phone: true,
      status: true,
    });

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
      setLoading(true);

      const currentToken =
        token ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

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

      console.log(
        "Patients API response:",
        result
      );

      if (response.ok && result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch patients:",
        error
      );
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

      const currentToken =
        token ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

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

      console.log(
        "Create patient response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to create patient"
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

      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Failed to create patient:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create patient"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Search + Filter
   */
  const filteredPatients = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return patients.filter((patient) => {
      const patientName =
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase();

      const matchesSearch =
        !searchText ||
        patient.medicalId
          .toLowerCase()
          .includes(searchText) ||
        patientName.includes(searchText) ||
        patient.email
          .toLowerCase()
          .includes(searchText) ||
        patient.phone
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        patient.status === statusFilter;

      const matchesGender =
        genderFilter === "ALL" ||
        patient.gender === genderFilter;

      const matchesDate =
        !dateFilter ||
        patient.dateOfBirth.startsWith(
          dateFilter
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGender &&
        matchesDate
      );
    });
  }, [
    patients,
    search,
    statusFilter,
    genderFilter,
    dateFilter,
  ]);

  /*
   * Sorting
   */
  const sortedPatients = useMemo(() => {
    const sorted = [...filteredPatients];

    sorted.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      switch (sortField) {
        case "medicalId":
          valueA = a.medicalId;
          valueB = b.medicalId;
          break;

        case "firstName":
          valueA =
            `${a.firstName} ${a.lastName}`;
          valueB =
            `${b.firstName} ${b.lastName}`;
          break;

        case "dateOfBirth":
          valueA = a.dateOfBirth;
          valueB = b.dateOfBirth;
          break;

        case "gender":
          valueA = a.gender;
          valueB = b.gender;
          break;

        case "phone":
          valueA = a.phone;
          valueB = b.phone;
          break;

        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
      }

      const comparison =
        valueA
          .toLowerCase()
          .localeCompare(
            valueB.toLowerCase()
          );

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return sorted;
  }, [
    filteredPatients,
    sortField,
    sortDirection,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedPatients.length / pageSize
    )
  );

  const paginatedPatients =
    sortedPatients.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  /*
   * Reset page whenever filters/search change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    genderFilter,
    dateFilter,
    pageSize,
  ]);

  /*
   * Sorting handler
   */
  const handleSort = (
    field: SortField
  ) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  /*
   * Clear filters
   */
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setGenderFilter("ALL");
    setDateFilter("");
    setCurrentPage(1);
  };

  /*
   * Column visibility
   */
  const toggleColumn = (
    column: keyof typeof visibleColumns
  ) => {
    setVisibleColumns((previous) => ({
      ...previous,
      [column]:
        !previous[column],
    }));
  };

  /*
   * Sort indicator
   */
  const sortIndicator = (
    field: SortField
  ) => {
    if (sortField !== field) {
      return "↕";
    }

    return sortDirection === "asc"
      ? "↑"
      : "↓";
  };

  return (
    <div className="patients-page">

      {/* ================= HEADER ================= */}

      <header className="patients-header">
        <div>
          <h1>Patients</h1>

          <p>
            Manage patient records and
            information.
          </p>
        </div>

        <div className="page-header-actions">
          <ContextualBackLink
            to="/dashboard"
            label="Back to Dashboard"
          />

          <button
            className="primary-button"
            onClick={() =>
              setShowForm(true)
            }
          >
            + Add Patient
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="patients-content">

        {/* ================= ADD PATIENT ================= */}

        {showForm && (
          <div className="patients-card patient-form-card">

            <div className="table-header">
              <h2>Add New Patient</h2>
            </div>

            <form
              onSubmit={handleAddPatient}
            >

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Medical ID
                  </label>

                  <input
                    type="text"
                    placeholder="PAT-10002"
                    value={
                      formData.medicalId
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalId:
                          e.target.value,
                      })
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
                    placeholder="First name"
                    value={
                      formData.firstName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName:
                          e.target.value,
                      })
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
                    placeholder="Last name"
                    value={
                      formData.lastName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName:
                          e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        dateOfBirth:
                          e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        gender:
                          e.target.value,
                      })
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
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
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
                    placeholder="9876543210"
                    value={
                      formData.phone
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    placeholder="Address"
                    value={
                      formData.address
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Blood Group
                  </label>

                  <input
                    type="text"
                    placeholder="O+"
                    value={
                      formData.bloodGroup
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bloodGroup:
                          e.target.value,
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
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
                    : "Save Patient"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ================= PATIENT LIST ================= */}

        <div className="patients-card">

          <div className="table-header">

            <h2>
              Patient Records
            </h2>

            <input
              type="text"
              placeholder="Search patients..."
              className="search-input"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* ================= FILTERS ================= */}

          <div
            className="patient-filters"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "15px",
            }}
          >

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Statuses
              </option>

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

            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Genders
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

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

            {/* Column Selection */}

            <div
              style={{
                position: "relative",
              }}
            >

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowColumnMenu(
                    !showColumnMenu
                  )
                }
              >
                Columns ▾
              </button>

              {showColumnMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    zIndex: 10,
                    background: "white",
                    border: "1px solid #ddd",
                    padding: "12px",
                    minWidth: "180px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.medicalId
                      }
                      onChange={() =>
                        toggleColumn(
                          "medicalId"
                        )
                      }
                    />
                    Medical ID
                  </label>

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.patient
                      }
                      onChange={() =>
                        toggleColumn(
                          "patient"
                        )
                      }
                    />
                    Patient
                  </label>

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.dateOfBirth
                      }
                      onChange={() =>
                        toggleColumn(
                          "dateOfBirth"
                        )
                      }
                    />
                    Date of Birth
                  </label>

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.gender
                      }
                      onChange={() =>
                        toggleColumn(
                          "gender"
                        )
                      }
                    />
                    Gender
                  </label>

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.phone
                      }
                      onChange={() =>
                        toggleColumn(
                          "phone"
                        )
                      }
                    />
                    Phone
                  </label>

                  <label
                    style={{
                      display: "block",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns.status
                      }
                      onChange={() =>
                        toggleColumn(
                          "status"
                        )
                      }
                    />
                    Status
                  </label>

                </div>
              )}

            </div>

          </div>

          {/* ================= RESULT COUNT ================= */}

          {!loading && (
            <div
              style={{
                marginBottom: "10px",
              }}
            >
              Showing{" "}
              {paginatedPatients.length} of{" "}
              {sortedPatients.length} patients
            </div>
          )}

          {/* ================= TABLE ================= */}

          {loading ? (
            <div className="loading">
              Loading patients...
            </div>
          ) : sortedPatients.length ===
            0 ? (
            <div className="empty-state">
              No patients found.
            </div>
          ) : (
            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    {visibleColumns.medicalId && (
                      <th
                        onClick={() =>
                          handleSort(
                            "medicalId"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Medical ID{" "}
                        {sortIndicator(
                          "medicalId"
                        )}
                      </th>
                    )}

                    {visibleColumns.patient && (
                      <th
                        onClick={() =>
                          handleSort(
                            "firstName"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Patient{" "}
                        {sortIndicator(
                          "firstName"
                        )}
                      </th>
                    )}

                    {visibleColumns.dateOfBirth && (
                      <th
                        onClick={() =>
                          handleSort(
                            "dateOfBirth"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Date of Birth{" "}
                        {sortIndicator(
                          "dateOfBirth"
                        )}
                      </th>
                    )}

                    {visibleColumns.gender && (
                      <th
                        onClick={() =>
                          handleSort(
                            "gender"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Gender{" "}
                        {sortIndicator(
                          "gender"
                        )}
                      </th>
                    )}

                    {visibleColumns.phone && (
                      <th
                        onClick={() =>
                          handleSort(
                            "phone"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Phone{" "}
                        {sortIndicator(
                          "phone"
                        )}
                      </th>
                    )}

                    {visibleColumns.status && (
                      <th
                        onClick={() =>
                          handleSort(
                            "status"
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        Status{" "}
                        {sortIndicator(
                          "status"
                        )}
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {paginatedPatients.map(
                    (patient) => (
                      <tr
                        key={patient.id}
                        className="clickable-row"
                        onClick={() =>
                          navigate(`/patients/${patient.id}`)
                        }
                      >

                        {visibleColumns.medicalId && (
                          <td>
                            {
                              patient.medicalId
                            }
                          </td>
                        )}

                        {visibleColumns.patient && (
                          <td>
                            <strong>
                              {
                                patient.firstName
                              }{" "}
                              {
                                patient.lastName
                              }
                            </strong>

                            <small>
                              {
                                patient.email
                              }
                            </small>
                          </td>
                        )}

                        {visibleColumns.dateOfBirth && (
                          <td>
                            {new Date(
                              patient.dateOfBirth
                            ).toLocaleDateString()}
                          </td>
                        )}

                        {visibleColumns.gender && (
                          <td>
                            {
                              patient.gender
                            }
                          </td>
                        )}

                        {visibleColumns.phone && (
                          <td>
                            {
                              patient.phone
                            }
                          </td>
                        )}

                        {visibleColumns.status && (
                          <td>
                            <span className="status-badge">
                              {
                                patient.status
                              }
                            </span>
                          </td>
                        )}

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* ================= PAGINATION ================= */}

          {!loading &&
            sortedPatients.length >
            0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "15px",
                }}
              >

                <div>
                  Page{" "}
                  {currentPage} of{" "}
                  {totalPages}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                  >
                    Next →
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >
                    <option value={5}>
                      5 / page
                    </option>

                    <option value={10}>
                      10 / page
                    </option>

                    <option value={25}>
                      25 / page
                    </option>

                    <option value={50}>
                      50 / page
                    </option>
                  </select>

                </div>

              </div>
            )}

        </div>

      </main>

    </div>
  );
}

export default Patients;