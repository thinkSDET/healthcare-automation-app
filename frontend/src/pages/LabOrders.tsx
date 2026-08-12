import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LabOrder {
  id: number;
  orderNo: string;
  patientId: number;
  doctorId: number;
  testName: string;
  status: string;
  orderedAt: string;
  resultFlag?: string | null;
  patient?: {
    firstName: string;
    lastName: string;
    medicalId: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

interface PatientOption {
  id: number;
  firstName: string;
  lastName: string;
  medicalId: string;
}

interface DoctorOption {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  status: string;
}

const STATUS_OPTIONS = [
  "ALL",
  "REQUESTED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "RESULT_AVAILABLE",
  "ACKNOWLEDGED",
  "CANCELLED",
  "REJECTED",
];

function LabOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    patientId: searchParams.get("patientId") || "",
    doctorId: "",
    testName: "",
    notes: "",
  });

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      const patientId = searchParams.get("patientId");
      if (patientId) {
        params.set("patientId", patientId);
      }

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(
        `http://localhost:4000/api/lab-orders${query}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load lab orders");
      }
      setOrders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lab orders");
    } finally {
      setLoading(false);
    }
  };

  const loadCreateOptions = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch("http://localhost:4000/api/patients", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch("http://localhost:4000/api/doctors", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const patientsJson = await patientsRes.json();
      const doctorsJson = await doctorsRes.json();
      if (patientsRes.ok && patientsJson.success) {
        setPatients(patientsJson.data || []);
      }
      if (doctorsRes.ok && doctorsJson.success) {
        setDoctors(
          (doctorsJson.data || []).filter(
            (d: DoctorOption) => d.status === "ACTIVE"
          )
        );
      }
    } catch {
      // options load failure shown on submit if needed
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchParams]);

  useEffect(() => {
    if (showCreate) {
      loadCreateOptions();
    }
  }, [showCreate]);

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await fetch("http://localhost:4000/api/lab-orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: Number(form.patientId),
          doctorId: Number(form.doctorId),
          testName: form.testName.trim(),
          notes: form.notes.trim() || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create lab order");
      }

      setSuccess(`Created ${result.data.orderNo}`);
      setShowCreate(false);
      setForm({
        patientId: searchParams.get("patientId") || "",
        doctorId: "",
        testName: "",
        notes: "",
      });
      await loadOrders();
      navigate(`/lab-orders/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lab order");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Lab Orders</h1>
          <p>
            Order lab tests, track processing, and acknowledge results before
            patient release.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Hide form" : "New lab order"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{ color: "#0f766e", fontWeight: 600 }}>{success}</div>
          )}

          {showCreate && (
            <form
              className="dependent-form"
              onSubmit={createOrder}
              style={{ marginBottom: "24px" }}
            >
              <h3>Create lab test order</h3>
              <div className="patient-edit-grid">
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    required
                    value={form.patientId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, patientId: e.target.value }))
                    }
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.medicalId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ordering doctor</label>
                  <select
                    required
                    value={form.doctorId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, doctorId: e.target.value }))
                    }
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Test name</label>
                  <input
                    required
                    value={form.testName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, testName: e.target.value }))
                    }
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>
                <div className="form-group patient-address-field">
                  <label>Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="primary-button"
                disabled={creating}
              >
                {creating ? "Creating…" : "Create order"}
              </button>
            </form>
          )}

          <div className="form-group">
            <label>Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : orders.length === 0 ? (
            <p>No lab orders found.</p>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNo}</strong>
                      <br />
                      <small>
                        {new Date(order.orderedAt).toLocaleString()}
                      </small>
                    </td>
                    <td>
                      {order.patient
                        ? `${order.patient.firstName} ${order.patient.lastName}`
                        : order.patientId}
                      {order.patient?.medicalId && (
                        <>
                          <br />
                          <small>{order.patient.medicalId}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {order.testName}
                      {order.resultFlag && (
                        <>
                          <br />
                          <small>{order.resultFlag}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {order.doctor
                        ? `Dr. ${order.doctor.firstName} ${order.doctor.lastName}`
                        : order.doctorId}
                    </td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(`/lab-orders/${order.id}`)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default LabOrders;
