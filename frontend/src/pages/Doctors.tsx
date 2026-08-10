import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Doctor {
  id: number;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  email: string;
  phone: string;
  experience: number;
  status: string;
}

interface DoctorAvailabilitySlot {
  id: string;
  day: number;
  startTime: string;
  endTime: string;
}

function Doctors() {
  const { user, token } = useAuth();

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [specializationFilter, setSpecializationFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [sortBy, setSortBy] =
    useState("NAME");

  const [sortDirection, setSortDirection] =
    useState<"ASC" | "DESC">("ASC");

  const [currentPage, setCurrentPage] =
    useState(1);

  const pageSize = 10;

  const isAdmin =
    user?.role?.toUpperCase() === "ADMIN";

  const [showAddDoctor, setShowAddDoctor] =
    useState(false);

  const [savingDoctor, setSavingDoctor] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [formSuccess, setFormSuccess] =
    useState("");

  const [doctorForm, setDoctorForm] =
    useState({
      doctorCode: "",
      firstName: "",
      lastName: "",
      specialization: "",
      licenseNumber: "",
      email: "",
      phone: "",
      experience: "",
      status: "ACTIVE",
    });

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [editingDoctor, setEditingDoctor] =
    useState<Doctor | null>(null);

  const [savingEditDoctor, setSavingEditDoctor] =
    useState(false);

  const [editDoctorError, setEditDoctorError] =
    useState("");

  const [changingStatusDoctor, setChangingStatusDoctor] =
    useState<Doctor | null>(null);

  const [statusChangeLoading, setStatusChangeLoading] =
    useState(false);

  const [statusChangeError, setStatusChangeError] =
    useState("");

  const [deletingDoctor, setDeletingDoctor] =
    useState<Doctor | null>(null);

  const [availabilityDoctor, setAvailabilityDoctor] =
    useState<Doctor | null>(null);

  const [availabilitySlots, setAvailabilitySlots] =
    useState<DoctorAvailabilitySlot[]>([]);

  const [availabilityError, setAvailabilityError] =
    useState("");

  const [availabilitySaving, setAvailabilitySaving] =
    useState(false);

  const availabilityDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [deleteDoctorLoading, setDeleteDoctorLoading] =
    useState(false);

  const [deleteDoctorError, setDeleteDoctorError] =
    useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const currentToken = token;

      const response = await fetch(
        "http://localhost:4000/api/doctors",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${currentToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      console.log(
        "Doctors API response:",
        result
      );

      if (
        response.ok &&
        result.success
      ) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch doctors:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Get unique specializations
   * from the doctors returned by API.
   */
  const specializations =
    useMemo(() => {
      return Array.from(
        new Set(
          doctors
            .map(
              (doctor) =>
                doctor.specialization
            )
            .filter(Boolean)
        )
      ).sort();
    }, [doctors]);

  /*
   * Get unique statuses
   * from the doctors returned by API.
   */
  const statuses =
    useMemo(() => {
      return Array.from(
        new Set(
          doctors
            .map(
              (doctor) =>
                doctor.status
            )
            .filter(Boolean)
        )
      ).sort();
    }, [doctors]);

  /*
   * Search + Filter
   */
  const filteredDoctors =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return doctors.filter(
        (doctor) => {
          const matchesSearch =
            !searchText ||
            `${doctor.firstName} ${doctor.lastName}`
              .toLowerCase()
              .includes(searchText) ||
            doctor.doctorCode
              .toLowerCase()
              .includes(searchText) ||
            doctor.specialization
              .toLowerCase()
              .includes(searchText) ||
            doctor.email
              .toLowerCase()
              .includes(searchText) ||
            doctor.phone
              .toLowerCase()
              .includes(searchText);

          const matchesSpecialization =
            specializationFilter ===
              "ALL" ||
            doctor.specialization ===
              specializationFilter;

          const matchesStatus =
            statusFilter === "ALL" ||
            doctor.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesSpecialization &&
            matchesStatus
          );
        }
      );
    }, [
      doctors,
      search,
      specializationFilter,
      statusFilter,
    ]);

  /*
   * Sorting
   */
  const sortedDoctors =
    useMemo(() => {
      const sorted = [
        ...filteredDoctors,
      ];

      sorted.sort(
        (first, second) => {
          let firstValue:
            | string
            | number;

          let secondValue:
            | string
            | number;

          switch (sortBy) {
            case "EXPERIENCE":
              firstValue =
                first.experience;

              secondValue =
                second.experience;

              break;

            case "SPECIALIZATION":
              firstValue =
                first.specialization
                  .toLowerCase();

              secondValue =
                second.specialization
                  .toLowerCase();

              break;

            case "STATUS":
              firstValue =
                first.status
                  .toLowerCase();

              secondValue =
                second.status
                  .toLowerCase();

              break;

            case "DOCTOR_CODE":
              firstValue =
                first.doctorCode
                  .toLowerCase();

              secondValue =
                second.doctorCode
                  .toLowerCase();

              break;

            case "NAME":
            default:
              firstValue =
                `${first.firstName} ${first.lastName}`
                  .toLowerCase();

              secondValue =
                `${second.firstName} ${second.lastName}`
                  .toLowerCase();

              break;
          }

          if (
            firstValue <
            secondValue
          ) {
            return sortDirection ===
              "ASC"
              ? -1
              : 1;
          }

          if (
            firstValue >
            secondValue
          ) {
            return sortDirection ===
              "ASC"
              ? 1
              : -1;
          }

          return 0;
        }
      );

      return sorted;
    }, [
      filteredDoctors,
      sortBy,
      sortDirection,
    ]);

  /*
   * Pagination
   */
  const totalPages =
    Math.ceil(
      sortedDoctors.length /
        pageSize
    );

  const paginatedDoctors =
    sortedDoctors.slice(
      (currentPage - 1) *
        pageSize,
      currentPage *
        pageSize
    );

  /*
   * Reset page when
   * search/filter changes.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    specializationFilter,
    statusFilter,
    sortBy,
    sortDirection,
  ]);

  /*
   * Clear all filters.
   */
  const clearFilters = () => {
    setSearch("");
    setSpecializationFilter(
      "ALL"
    );
    setStatusFilter("ALL");
    setSortBy("NAME");
    setSortDirection("ASC");
    setCurrentPage(1);
  };

  /*
   * Change sorting direction.
   */
  const handleSortChange = (
    value: string
  ) => {
    if (value === sortBy) {
      setSortDirection(
        (previous) =>
          previous === "ASC"
            ? "DESC"
            : "ASC"
      );

      return;
    }

    setSortBy(value);
    setSortDirection("ASC");
  };


  const handleDoctorFormChange = (
    field: keyof typeof doctorForm,
    value: string
  ) => {
    setDoctorForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    setFormSuccess("");
  };

  const resetDoctorForm = () => {
    setDoctorForm({
      doctorCode: "",
      firstName: "",
      lastName: "",
      specialization: "",
      licenseNumber: "",
      email: "",
      phone: "",
      experience: "",
      status: "ACTIVE",
    });

    setFormError("");
    setFormSuccess("");
  };

  const closeDoctorForm = () => {
    if (savingDoctor) {
      return;
    }

    setShowAddDoctor(false);
    resetDoctorForm();
  };

  const handleCreateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const firstName =
      doctorForm.firstName.trim();

    const lastName =
      doctorForm.lastName.trim();

    const specialization =
      doctorForm.specialization.trim();

    const licenseNumber =
      doctorForm.licenseNumber.trim();

    const email =
      doctorForm.email.trim();

    const phone =
      doctorForm.phone.trim();

    const doctorCode =
      doctorForm.doctorCode.trim();

    const experienceText =
      doctorForm.experience.trim();

    if (!doctorCode) {
      setFormError(
        "Doctor Code is required."
      );
      return;
    }

    if (!firstName) {
      setFormError(
        "First Name is required."
      );
      return;
    }

    if (!lastName) {
      setFormError(
        "Last Name is required."
      );
      return;
    }

    if (!specialization) {
      setFormError(
        "Specialization is required."
      );
      return;
    }

    if (!licenseNumber) {
      setFormError(
        "License Number is required."
      );
      return;
    }

    if (!email) {
      setFormError(
        "Email is required."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!phone) {
      setFormError(
        "Phone number is required."
      );
      return;
    }

    if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      setFormError(
        "Please enter a valid phone number."
      );
      return;
    }

    if (!experienceText) {
      setFormError(
        "Experience is required."
      );
      return;
    }

    const experience =
      Number(experienceText);

    if (
      !Number.isInteger(experience) ||
      experience < 0 ||
      experience > 60
    ) {
      setFormError(
        "Experience must be a whole number between 0 and 60."
      );
      return;
    }

    try {
      setSavingDoctor(true);

      const response = await fetch(
        "http://localhost:4000/api/doctors",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            doctorCode,
            firstName,
            lastName,
            specialization,
            licenseNumber,
            email,
            phone,
            experience,
            status:
              doctorForm.status,
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
            "Failed to create doctor."
        );
      }

      setDoctors((previous) => [
        result.data,
        ...previous,
      ]);

      setFormSuccess(
        "Doctor created successfully."
      );

      resetDoctorForm();

      setShowAddDoctor(false);

      setCurrentPage(1);

    } catch (error) {
      console.error(
        "Failed to create doctor:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create doctor."
      );
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) {
      return;
    }

    try {
      setDeleteDoctorLoading(true);
      setDeleteDoctorError("");

      const response = await fetch(
        `http://localhost:4000/api/doctors/${deletingDoctor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete doctor."
        );
      }

      setDoctors((previous) =>
        previous.filter(
          (doctor) =>
            doctor.id !== deletingDoctor.id
        )
      );

      setFormSuccess(
        "Doctor deleted successfully."
      );

      setDeletingDoctor(null);
      setCurrentPage(1);

    } catch (error) {
      console.error(
        "Failed to delete doctor:",
        error
      );

      setDeleteDoctorError(
        error instanceof Error
          ? error.message
          : "Failed to delete doctor."
      );
    } finally {
      setDeleteDoctorLoading(false);
    }
  };

  const handleDoctorStatusChange = async () => {
    if (!changingStatusDoctor) {
      return;
    }

    const doctor = changingStatusDoctor;

    const newStatus =
      doctor.status.toUpperCase() ===
        "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      setStatusChangeLoading(true);
      setStatusChangeError("");

      const response = await fetch(
        `http://localhost:4000/api/doctors/${doctor.id}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
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
            "Failed to update doctor status."
        );
      }

      setDoctors((previous) =>
        previous.map((item) =>
          item.id === doctor.id
            ? {
                ...item,
                ...result.data,
              }
            : item
        )
      );

      setFormSuccess(
        `Doctor status changed to ${newStatus}.`
      );

      setChangingStatusDoctor(null);

    } catch (error) {
      console.error(
        "Failed to change doctor status:",
        error
      );

      setStatusChangeError(
        error instanceof Error
          ? error.message
          : "Failed to update doctor status."
      );
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const handleEditDoctor = (
    doctor: Doctor
  ) => {
    setSelectedDoctor(null);
    setEditDoctorError("");
    setEditingDoctor(doctor);
  };

  const handleEditDoctorChange = (
    field: keyof Doctor,
    value: string
  ) => {
    setEditingDoctor((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]:
          field === "experience"
            ? Number(value)
            : value,
      };
    });

    setEditDoctorError("");
  };

  const closeEditDoctor = () => {
    if (savingEditDoctor) {
      return;
    }

    setEditingDoctor(null);
    setEditDoctorError("");
  };

  const handleUpdateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingDoctor) {
      return;
    }

    setEditDoctorError("");

    const firstName =
      editingDoctor.firstName.trim();

    const lastName =
      editingDoctor.lastName.trim();

    const specialization =
      editingDoctor.specialization.trim();

    const licenseNumber =
      editingDoctor.licenseNumber.trim();

    const email =
      editingDoctor.email.trim();

    const phone =
      editingDoctor.phone.trim();

    if (!firstName) {
      setEditDoctorError(
        "First Name is required."
      );
      return;
    }

    if (!lastName) {
      setEditDoctorError(
        "Last Name is required."
      );
      return;
    }

    if (!specialization) {
      setEditDoctorError(
        "Specialization is required."
      );
      return;
    }

    if (!licenseNumber) {
      setEditDoctorError(
        "License Number is required."
      );
      return;
    }

    if (!email) {
      setEditDoctorError(
        "Email is required."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setEditDoctorError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!phone) {
      setEditDoctorError(
        "Phone number is required."
      );
      return;
    }

    if (
      !/^[0-9+()\-\s]{7,20}$/.test(
        phone
      )
    ) {
      setEditDoctorError(
        "Please enter a valid phone number."
      );
      return;
    }

    if (
      !Number.isInteger(
        editingDoctor.experience
      ) ||
      editingDoctor.experience < 0 ||
      editingDoctor.experience > 60
    ) {
      setEditDoctorError(
        "Experience must be a whole number between 0 and 60."
      );
      return;
    }

    try {
      setSavingEditDoctor(true);

      const response = await fetch(
        `http://localhost:4000/api/doctors/${editingDoctor.id}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            specialization,
            licenseNumber,
            email,
            phone,
            experience:
              editingDoctor.experience,
            status:
              editingDoctor.status,
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
            "Failed to update doctor."
        );
      }

      setDoctors((previous) =>
        previous.map((doctor) =>
          doctor.id === editingDoctor.id
            ? result.data
            : doctor
        )
      );

      setFormSuccess(
        "Doctor updated successfully."
      );

      setEditingDoctor(null);

    } catch (error) {
      console.error(
        "Failed to update doctor:",
        error
      );

      setEditDoctorError(
        error instanceof Error
          ? error.message
          : "Failed to update doctor."
      );
    } finally {
      setSavingEditDoctor(false);
    }
  };

  const handleViewDoctor = (
    doctor: Doctor
  ) => {
    setSelectedDoctor(doctor);
  };


  const getDefaultAvailability = (
    doctorId: number
  ): DoctorAvailabilitySlot[] => {
    return [1, 2, 3, 4, 5].map(
      (day) => ({
        id: `${doctorId}-${day}-default`,
        day,
        startTime: "09:00",
        endTime: "17:00",
      })
    );
  };

  const loadDoctorAvailability = (
    doctorId: number
  ) => {
    const raw =
      localStorage.getItem(
        "doctorAvailability"
      );

    if (!raw) {
      return getDefaultAvailability(
        doctorId
      );
    }

    try {
      const saved =
        JSON.parse(raw) as Record<
          string,
          DoctorAvailabilitySlot[]
        >;

      return (
        saved[String(doctorId)] ||
        getDefaultAvailability(
          doctorId
        )
      );
    } catch {
      return getDefaultAvailability(
        doctorId
      );
    }
  };

  const openAvailability = (
    doctor: Doctor
  ) => {
    setAvailabilityDoctor(doctor);
    setAvailabilityError("");
    setAvailabilitySlots(
      loadDoctorAvailability(
        doctor.id
      )
    );
  };

  const closeAvailability = () => {
    if (availabilitySaving) {
      return;
    }

    setAvailabilityDoctor(null);
    setAvailabilitySlots([]);
    setAvailabilityError("");
  };

  const addAvailabilitySlot = (
    day: number
  ) => {
    setAvailabilitySlots(
      (previous) => [
        ...previous,
        {
          id:
            `${Date.now()}-${Math.random()}`,
          day,
          startTime: "09:00",
          endTime: "17:00",
        },
      ]
    );
  };

  const updateAvailabilitySlot = (
    slotId: string,
    field:
      | "startTime"
      | "endTime",
    value: string
  ) => {
    setAvailabilitySlots(
      (previous) =>
        previous.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                [field]: value,
              }
            : slot
        )
    );

    setAvailabilityError("");
  };

  const removeAvailabilitySlot = (
    slotId: string
  ) => {
    setAvailabilitySlots(
      (previous) =>
        previous.filter(
          (slot) =>
            slot.id !== slotId
        )
    );
  };

  const saveDoctorAvailability = () => {
    if (!availabilityDoctor) {
      return;
    }

    setAvailabilityError("");

    for (const slot of availabilitySlots) {
      if (
        !slot.startTime ||
        !slot.endTime
      ) {
        setAvailabilityError(
          "Start and end time are required for every availability slot."
        );
        return;
      }

      if (
        slot.startTime >=
        slot.endTime
      ) {
        setAvailabilityError(
          "End time must be later than start time."
        );
        return;
      }
    }

    const grouped =
      availabilitySlots.reduce(
        (
          result,
          slot
        ) => {
          if (!result[slot.day]) {
            result[slot.day] = [];
          }

          result[slot.day].push(slot);

          return result;
        },
        {} as Record<
          number,
          DoctorAvailabilitySlot[]
        >
      );

    for (const day of Object.keys(grouped)) {
      const slots = [
        ...grouped[Number(day)],
      ].sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime
        )
      );

      for (
        let index = 1;
        index < slots.length;
        index++
      ) {
        if (
          slots[index].startTime <
          slots[index - 1].endTime
        ) {
          setAvailabilityError(
            `Overlapping availability slots found on ${availabilityDays[Number(day)]}.`
          );
          return;
        }
      }
    }

    try {
      setAvailabilitySaving(true);

      const raw =
        localStorage.getItem(
          "doctorAvailability"
        );

      const saved = raw
        ? JSON.parse(raw)
        : {};

      saved[
        String(availabilityDoctor.id)
      ] = availabilitySlots;

      localStorage.setItem(
        "doctorAvailability",
        JSON.stringify(saved)
      );

      setFormSuccess(
        "Doctor availability saved successfully."
      );

      setAvailabilityDoctor(null);
      setAvailabilitySlots([]);

    } catch (error) {
      console.error(
        "Failed to save availability:",
        error
      );

      setAvailabilityError(
        "Failed to save doctor availability."
      );
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <div className="patients-page">

      <header className="patients-header">

        <div>
          <h1>
            Doctors
          </h1>

          <p>
            Manage healthcare providers
            and their information.
          </p>
        </div>

        {/* Only ADMIN can add doctors */}

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              resetDoctorForm();
              setShowAddDoctor(true);
            }}
          >
            + Add Doctor
          </button>
        )}

      </header>



      {formSuccess && (
        <div className="doctor-form-success">
          {formSuccess}
        </div>
      )}

      {showAddDoctor && (
        <div className="doctor-form-overlay">

          <div className="doctor-form-modal">

            <div className="doctor-form-header">

              <div>
                <h2>
                  Add Doctor
                </h2>

                <p>
                  Create a new healthcare provider record.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={closeDoctorForm}
                disabled={savingDoctor}
              >
                Close
              </button>

            </div>

            {formError && (
              <div className="doctor-form-error">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleCreateDoctor}
              noValidate
            >

              <div className="doctor-form-grid">

                <div>
                  <label>
                    Doctor Code *
                  </label>

                  <input
                    type="text"
                    value={
                      doctorForm.doctorCode
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "doctorCode",
                        e.target.value
                      )
                    }
                    placeholder="e.g. DOC-1001"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label>
                    License Number *
                  </label>

                  <input
                    type="text"
                    value={
                      doctorForm.licenseNumber
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "licenseNumber",
                        e.target.value
                      )
                    }
                    placeholder="Medical license number"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    First Name *
                  </label>

                  <input
                    type="text"
                    value={
                      doctorForm.firstName
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "firstName",
                        e.target.value
                      )
                    }
                    placeholder="First name"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    Last Name *
                  </label>

                  <input
                    type="text"
                    value={
                      doctorForm.lastName
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "lastName",
                        e.target.value
                      )
                    }
                    placeholder="Last name"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    Specialization *
                  </label>

                  <input
                    type="text"
                    value={
                      doctorForm.specialization
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "specialization",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Cardiology"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label>
                    Experience *
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={
                      doctorForm.experience
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "experience",
                        e.target.value
                      )
                    }
                    placeholder="Years"
                  />
                </div>

                <div>
                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    value={
                      doctorForm.email
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="doctor@example.com"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label>
                    Phone *
                  </label>

                  <input
                    type="tel"
                    value={
                      doctorForm.phone
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+91 9876543210"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label>
                    Status *
                  </label>

                  <select
                    value={
                      doctorForm.status
                    }
                    onChange={(e) =>
                      handleDoctorFormChange(
                        "status",
                        e.target.value
                      )
                    }
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>
                </div>

              </div>

              <div className="doctor-form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeDoctorForm
                  }
                  disabled={savingDoctor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingDoctor}
                >
                  {savingDoctor
                    ? "Creating..."
                    : "Create Doctor"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {selectedDoctor && (
        <div
          className="doctor-details-overlay"
          onClick={() =>
            setSelectedDoctor(null)
          }
        >

          <div
            className="doctor-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doctor-details-header">

              <div>
                <h2>
                  Dr.{" "}
                  {selectedDoctor.firstName}{" "}
                  {selectedDoctor.lastName}
                </h2>

                <p>
                  {selectedDoctor.specialization}
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedDoctor(null)
                }
              >
                Close
              </button>

            </div>


            <div className="doctor-details-status">

              <span>
                Current Status
              </span>

              <strong className="status-badge">
                {selectedDoctor.status}
              </strong>

            </div>


            <div className="doctor-details-grid">

              <div className="doctor-detail-card">

                <h3>
                  Professional Information
                </h3>

                <div className="doctor-detail-row">
                  <span>
                    Doctor Code
                  </span>

                  <strong>
                    {selectedDoctor.doctorCode}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    Specialization
                  </span>

                  <strong>
                    {selectedDoctor.specialization}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    License Number
                  </span>

                  <strong>
                    {selectedDoctor.licenseNumber}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    Experience
                  </span>

                  <strong>
                    {selectedDoctor.experience} years
                  </strong>
                </div>

              </div>


              <div className="doctor-detail-card">

                <h3>
                  Contact Information
                </h3>

                <div className="doctor-detail-row">
                  <span>
                    First Name
                  </span>

                  <strong>
                    {selectedDoctor.firstName}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    Last Name
                  </span>

                  <strong>
                    {selectedDoctor.lastName}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedDoctor.email}
                  </strong>
                </div>

                <div className="doctor-detail-row">
                  <span>
                    Phone
                  </span>

                  <strong>
                    {selectedDoctor.phone}
                  </strong>
                </div>

              </div>

            </div>



          </div>

        </div>
      )}

      {editingDoctor && (
        <div
          className="doctor-edit-overlay"
          onClick={closeEditDoctor}
        >
          <div
            className="doctor-edit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="doctor-form-header">
              <div>
                <h2>
                  Edit Doctor
                </h2>
                <p>
                  Update the healthcare provider information.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={closeEditDoctor}
                disabled={savingEditDoctor}
              >
                Close
              </button>
            </div>

            {editDoctorError && (
              <div className="doctor-form-error">
                {editDoctorError}
              </div>
            )}

            <form
              onSubmit={handleUpdateDoctor}
              noValidate
            >
              <div className="doctor-form-grid">

                <div>
                  <label>
                    Doctor Code
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.doctorCode}
                    disabled
                  />
                </div>

                <div>
                  <label>
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.licenseNumber}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "licenseNumber",
                        e.target.value
                      )
                    }
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.firstName}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "firstName",
                        e.target.value
                      )
                    }
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.lastName}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "lastName",
                        e.target.value
                      )
                    }
                    maxLength={50}
                  />
                </div>

                <div>
                  <label>
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.specialization}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "specialization",
                        e.target.value
                      )
                    }
                    maxLength={100}
                  />
                </div>

                <div>
                  <label>
                    Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={editingDoctor.experience}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "experience",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingDoctor.email}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "email",
                        e.target.value
                      )
                    }
                    maxLength={150}
                  />
                </div>

                <div>
                  <label>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={editingDoctor.phone}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "phone",
                        e.target.value
                      )
                    }
                    maxLength={20}
                  />
                </div>

                <div>
                  <label>
                    Status *
                  </label>
                  <select
                    value={editingDoctor.status}
                    onChange={(e) =>
                      handleEditDoctorChange(
                        "status",
                        e.target.value
                      )
                    }
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>
                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>
                </div>

              </div>

              <div className="doctor-form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditDoctor}
                  disabled={savingEditDoctor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingEditDoctor}
                >
                  {savingEditDoctor
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {changingStatusDoctor && (
        <div
          className="doctor-status-overlay"
          onClick={() => {
            if (!statusChangeLoading) {
              setChangingStatusDoctor(null);
              setStatusChangeError("");
            }
          }}
        >
          <div
            className="doctor-status-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doctor-status-header">
              <div>
                <h2>
                  Change Doctor Status
                </h2>

                <p>
                  Update the availability state of this doctor.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                disabled={statusChangeLoading}
                onClick={() => {
                  setChangingStatusDoctor(null);
                  setStatusChangeError("");
                }}
              >
                Close
              </button>
            </div>

            {statusChangeError && (
              <div className="doctor-form-error">
                {statusChangeError}
              </div>
            )}

            <div className="doctor-status-confirmation">

              <div className="doctor-status-confirm-icon">
                {changingStatusDoctor.status.toUpperCase() ===
                "ACTIVE"
                  ? "⚠️"
                  : "✓"}
              </div>

              <div>
                <strong>
                  Dr.{" "}
                  {changingStatusDoctor.firstName}{" "}
                  {changingStatusDoctor.lastName}
                </strong>

                <p>
                  Current status:{" "}
                  <strong>
                    {changingStatusDoctor.status}
                  </strong>
                </p>

                <p>
                  New status:{" "}
                  <strong>
                    {changingStatusDoctor.status.toUpperCase() ===
                    "ACTIVE"
                      ? "INACTIVE"
                      : "ACTIVE"}
                  </strong>
                </p>
              </div>

            </div>

            <div className="doctor-status-warning">
              {changingStatusDoctor.status.toUpperCase() ===
              "ACTIVE"
                ? "Deactivating this doctor will prevent the doctor from being treated as active."
                : "Activating this doctor will make the doctor active again."}
            </div>

            <div className="doctor-form-actions">

              <button
                type="button"
                className="secondary-button"
                disabled={statusChangeLoading}
                onClick={() => {
                  setChangingStatusDoctor(null);
                  setStatusChangeError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={statusChangeLoading}
                onClick={
                  handleDoctorStatusChange
                }
              >
                {statusChangeLoading
                  ? "Updating..."
                  : "Confirm Status Change"}
              </button>

            </div>

          </div>
        </div>
      )}

      {deletingDoctor && (
        <div
          className="doctor-delete-overlay"
          onClick={() => {
            if (!deleteDoctorLoading) {
              setDeletingDoctor(null);
              setDeleteDoctorError("");
            }
          }}
        >
          <div
            className="doctor-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doctor-delete-header">
              <div>
                <h2>Delete Doctor</h2>

                <p>
                  This action will remove the doctor record.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                disabled={deleteDoctorLoading}
                onClick={() => {
                  setDeletingDoctor(null);
                  setDeleteDoctorError("");
                }}
              >
                Close
              </button>
            </div>

            {deleteDoctorError && (
              <div className="doctor-form-error">
                {deleteDoctorError}
              </div>
            )}

            <div className="doctor-delete-confirmation">

              <div className="doctor-delete-icon">
                ⚠️
              </div>

              <div>
                <strong>
                  Dr.{" "}
                  {deletingDoctor.firstName}{" "}
                  {deletingDoctor.lastName}
                </strong>

                <p>
                  Doctor Code:{" "}
                  <strong>
                    {deletingDoctor.doctorCode}
                  </strong>
                </p>

                <p>
                  Specialization:{" "}
                  <strong>
                    {deletingDoctor.specialization}
                  </strong>
                </p>
              </div>

            </div>

            <div className="doctor-delete-warning">
              Are you sure you want to permanently delete this doctor?
              This operation cannot be undone.
            </div>

            <div className="doctor-form-actions">

              <button
                type="button"
                className="secondary-button"
                disabled={deleteDoctorLoading}
                onClick={() => {
                  setDeletingDoctor(null);
                  setDeleteDoctorError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                disabled={deleteDoctorLoading}
                onClick={handleDeleteDoctor}
              >
                {deleteDoctorLoading
                  ? "Deleting..."
                  : "Delete Doctor"}
              </button>

            </div>

          </div>
        </div>
      )}


      {availabilityDoctor && (
        <div
          className="doctor-availability-overlay"
          onClick={closeAvailability}
        >
          <div
            className="doctor-availability-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doctor-form-header">
              <div>
                <h2>
                  Doctor Availability
                </h2>

                <p>
                  Dr.{" "}
                  {availabilityDoctor.firstName}{" "}
                  {availabilityDoctor.lastName}
                  {" • "}
                  {availabilityDoctor.specialization}
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={closeAvailability}
                disabled={availabilitySaving}
              >
                Close
              </button>
            </div>

            {availabilityError && (
              <div className="doctor-form-error">
                {availabilityError}
              </div>
            )}

            <div className="doctor-availability-help">
              Add one or more slots per day. Same-day slots cannot overlap.
            </div>

            <div className="doctor-availability-list">
              {availabilityDays.map(
                (dayName, dayIndex) => {
                  const daySlots =
                    availabilitySlots.filter(
                      (slot) =>
                        slot.day ===
                        dayIndex
                    );

                  return (
                    <div
                      className="doctor-availability-day"
                      key={dayName}
                    >
                      <div className="doctor-availability-day-header">
                        <strong>
                          {dayName}
                        </strong>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            addAvailabilitySlot(
                              dayIndex
                            )
                          }
                        >
                          + Add Slot
                        </button>
                      </div>

                      {daySlots.length === 0 ? (
                        <span className="doctor-availability-off">
                          OFF
                        </span>
                      ) : (
                        daySlots.map(
                          (slot) => (
                            <div
                              className="doctor-availability-slot"
                              key={slot.id}
                            >
                              <input
                                type="time"
                                value={
                                  slot.startTime
                                }
                                onChange={(e) =>
                                  updateAvailabilitySlot(
                                    slot.id,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                              />

                              <span>
                                to
                              </span>

                              <input
                                type="time"
                                value={
                                  slot.endTime
                                }
                                onChange={(e) =>
                                  updateAvailabilitySlot(
                                    slot.id,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="danger-button"
                                onClick={() =>
                                  removeAvailabilitySlot(
                                    slot.id
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="doctor-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeAvailability}
                disabled={availabilitySaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={
                  saveDoctorAvailability
                }
                disabled={availabilitySaving}
              >
                {availabilitySaving
                  ? "Saving..."
                  : "Save Availability"}
              </button>
            </div>

          </div>
        </div>
      )}

      <main className="patients-content">

        <div className="patients-card">

          <div className="table-header">

            <h2>
              Doctor Records
            </h2>

            <input
              type="text"
              placeholder="Search doctors..."
              className="search-input"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          {/* =========================
              Filters
          ========================= */}

          <div className="doctor-filters">

            <div>
              <label>
                Specialization
              </label>

              <select
                value={
                  specializationFilter
                }
                onChange={(e) =>
                  setSpecializationFilter(
                    e.target.value
                  )
                }
              >

                <option value="ALL">
                  All Specializations
                </option>

                {specializations.map(
                  (specialization) => (
                    <option
                      key={
                        specialization
                      }
                      value={
                        specialization
                      }
                    >
                      {specialization}
                    </option>
                  )
                )}

              </select>
            </div>


            <div>
              <label>
                Status
              </label>

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="ALL">
                  All Statuses
                </option>

                {statuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}

              </select>
            </div>


            <div>
              <label>
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value
                  )
                }
              >

                <option value="NAME">
                  Doctor Name
                </option>

                <option value="DOCTOR_CODE">
                  Doctor Code
                </option>

                <option value="SPECIALIZATION">
                  Specialization
                </option>

                <option value="EXPERIENCE">
                  Experience
                </option>

                <option value="STATUS">
                  Status
                </option>

              </select>
            </div>


            <div>
              <label>
                Direction
              </label>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSortDirection(
                    (previous) =>
                      previous ===
                      "ASC"
                        ? "DESC"
                        : "ASC"
                  )
                }
              >
                {sortDirection ===
                "ASC"
                  ? "↑ Ascending"
                  : "↓ Descending"}
              </button>
            </div>


            <div className="doctor-filter-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

            </div>

          </div>


          {/* =========================
              Results Summary
          ========================= */}

          {!loading && (
            <div className="doctor-results-summary">

              <span>
                Showing{" "}
                <strong>
                  {paginatedDoctors.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {sortedDoctors.length}
                </strong>{" "}
                doctors
              </span>

              {(search ||
                specializationFilter !==
                  "ALL" ||
                statusFilter !==
                  "ALL") && (
                <span>
                  Filters applied
                </span>
              )}

            </div>
          )}


          {loading ? (

            <div className="loading">
              Loading doctors...
            </div>

          ) : sortedDoctors.length ===
            0 ? (

            <div className="empty-state">

              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "10px",
                }}
              >
                👨‍⚕️
              </div>

              <strong>
                No doctors found
              </strong>

              <p>
                No doctors match the
                selected search or
                filters.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <>

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Doctor Code
                      </th>

                      <th>
                        Doctor
                      </th>

                      <th>
                        Specialization
                      </th>

                      <th>
                        License Number
                      </th>

                      <th>
                        Experience
                      </th>

                      <th>
                        Phone
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {paginatedDoctors.map(
                      (doctor) => (

                        <tr
                          key={
                            doctor.id
                          }
                        >

                          <td>
                            {
                              doctor.doctorCode
                            }
                          </td>


                          <td>

                            <strong>
                              Dr.{" "}
                              {
                                doctor.firstName
                              }{" "}
                              {
                                doctor.lastName
                              }
                            </strong>

                            <small>
                              {
                                doctor.email
                              }
                            </small>

                          </td>


                          <td>
                            {
                              doctor.specialization
                            }
                          </td>


                          <td>
                            {
                              doctor.licenseNumber
                            }
                          </td>


                          <td>
                            {
                              doctor.experience
                            }{" "}
                            years
                          </td>


                          <td>
                            {
                              doctor.phone
                            }
                          </td>


                          <td>

                            <span className="status-badge">
                              {
                                doctor.status
                              }
                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="secondary-button doctor-view-button"
                              onClick={() =>
                                handleViewDoctor(
                                  doctor
                                )
                              }
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              className="secondary-button doctor-view-button"
                              onClick={() =>
                                handleEditDoctor(
                                  doctor
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="secondary-button doctor-view-button"
                              onClick={() => {
                                setStatusChangeError("");
                                setChangingStatusDoctor(
                                  doctor
                                );
                              }}
                            >
                              {doctor.status.toUpperCase() ===
                              "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              className="secondary-button doctor-view-button"
                              onClick={() =>
                                openAvailability(
                                  doctor
                                )
                              }
                            >
                              Availability
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* =========================
                  Pagination
              ========================= */}

              {totalPages > 1 && (

                <div className="doctor-pagination">

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      currentPage ===
                      1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.max(
                            1,
                            previous - 1
                          )
                      )
                    }
                  >
                    ← Previous
                  </button>


                  <div className="doctor-page-numbers">

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (page) => (

                        <button
                          type="button"
                          key={page}
                          className={
                            page ===
                            currentPage
                              ? "doctor-page-button active"
                              : "doctor-page-button"
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>

                      )
                    )}

                  </div>


                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.min(
                            totalPages,
                            previous + 1
                          )
                      )
                    }
                  >
                    Next →
                  </button>

                </div>

              )}

            </>

          )}

        </div>

      </main>

    </div>
  );
}

export default Doctors;