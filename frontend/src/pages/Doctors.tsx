import { useEffect, useState } from "react";
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

function Doctors() {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:4000/api/doctors",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("Doctors API response:", result);

      if (response.ok && result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const searchText = search.toLowerCase();

    return (
      doctor.firstName.toLowerCase().includes(searchText) ||
      doctor.lastName.toLowerCase().includes(searchText) ||
      doctor.doctorCode.toLowerCase().includes(searchText) ||
      doctor.specialization.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="page">

      <header className="patients-header">
        <div>
          <h1>Doctors</h1>

          <p>
            Manage healthcare providers and their information.
          </p>
        </div>

        {/* Only ADMIN can add doctors */}
        {isAdmin && (
          <button className="primary-button">
            + Add Doctor
          </button>
        )}
      </header>

      <main className="patients-content">

        <div className="patients-card">

          <div className="table-header">
            <h2>Doctor Records</h2>

            <input
              type="text"
              placeholder="Search doctors..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading doctors...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">
              No doctors found.
            </div>
          ) : (
            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>Doctor Code</th>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>License Number</th>
                    <th>Experience</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>

                      <td>
                        {doctor.doctorCode}
                      </td>

                      <td>
                        <strong>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </strong>

                        <small>
                          {doctor.email}
                        </small>
                      </td>

                      <td>
                        {doctor.specialization}
                      </td>

                      <td>
                        {doctor.licenseNumber}
                      </td>

                      <td>
                        {doctor.experience} years
                      </td>

                      <td>
                        {doctor.phone}
                      </td>

                      <td>
                        <span className="status-badge">
                          {doctor.status}
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

export default Doctors;