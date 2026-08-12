import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Prescription {
  id: number;
  prescriptionNo: string;
  patientId: number;
  status: string;
  prescribedAt: string;
  diagnosis?: string | null;
  items?: Array<{ medicineName: string; dosage: string }>;
}

interface Order {
  id: number;
  orderNo?: string;
  patientId: number;
  status: string;
  paymentStatus: string;
  orderDate?: string;
  items?: Array<{ productName: string; quantity: number }>;
}

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const RX_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"];

function PharmacyWorkspace() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [patientIdInput, setPatientIdInput] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [prescriptionIdInput, setPrescriptionIdInput] =
    useState("");
  const [activePatientId, setActivePatientId] = useState<
    number | null
  >(null);
  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadByPatientId = async (patientId: number) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [rxRes, orderRes] = await Promise.all([
        fetch(
          `http://localhost:4000/api/prescriptions/patient/${patientId}`,
          { headers: authHeaders() }
        ),
        fetch(
          `http://localhost:4000/api/orders/patient/${patientId}`,
          { headers: authHeaders() }
        ),
      ]);

      const rxResult = await rxRes.json();
      const orderResult = await orderRes.json();

      if (!rxRes.ok || !rxResult.success) {
        throw new Error(
          rxResult.message ||
            "Failed to load prescriptions"
        );
      }

      if (!orderRes.ok || !orderResult.success) {
        throw new Error(
          orderResult.message || "Failed to load orders"
        );
      }

      setActivePatientId(patientId);
      setPrescriptions(rxResult.data || []);
      setOrders(orderResult.data || []);
      setSuccess(
        `Loaded pharmacy records for patient #${patientId}.`
      );
    } catch (err) {
      setActivePatientId(null);
      setPrescriptions([]);
      setOrders([]);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pharmacy records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLookupPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientId = Number(patientIdInput);
    if (!patientId || Number.isNaN(patientId)) {
      setError("Enter a valid patient ID.");
      return;
    }
    await loadByPatientId(patientId);
  };

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = orderIdInput.trim();
    if (!identifier) {
      setError(
        "Enter a valid order ID or order number (e.g. ORD-...)."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/orders/${encodeURIComponent(identifier)}`,
        { headers: authHeaders() }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load order"
        );
      }

      await loadByPatientId(result.data.patientId);
      setOrderIdInput("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order"
      );
      setLoading(false);
    }
  };

  const handleLookupPrescription = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const prescriptionId = Number(prescriptionIdInput);
    if (!prescriptionId || Number.isNaN(prescriptionId)) {
      setError("Enter a valid prescription ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/prescriptions/${prescriptionId}`,
        { headers: authHeaders() }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load prescription"
        );
      }

      await loadByPatientId(result.data.patientId);
      setPrescriptionIdInput("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load prescription"
      );
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (
    prescriptionId: number,
    status: string
  ) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch(
        `http://localhost:4000/api/prescriptions/${prescriptionId}/status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update prescription status"
        );
      }

      setPrescriptions((prev) =>
        prev.map((item) =>
          item.id === prescriptionId
            ? { ...item, status }
            : item
        )
      );
      setSuccess("Prescription status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update prescription status"
      );
    }
  };

  const requestRefill = async (prescriptionId: number) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch(
        `http://localhost:4000/api/prescriptions/${prescriptionId}/refill-requests`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ requestType: "REFILL" }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit refill request"
        );
      }
      setSuccess(
        `Refill request ${result.data.requestNo} submitted.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit refill request"
      );
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: string
  ) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch(
        `http://localhost:4000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update order status"
        );
      }

      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, status } : item
        )
      );
      setSuccess("Order status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status"
      );
    }
  };

  const updatePaymentStatus = async (
    orderId: number,
    paymentStatus: string
  ) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch(
        `http://localhost:4000/api/orders/${orderId}/payment-status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ paymentStatus }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update payment status"
        );
      }

      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId
            ? { ...item, paymentStatus }
            : item
        )
      );
      setSuccess("Payment status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment status"
      );
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Pharmacy Workspace</h1>
          <p>
            Look up prescriptions and orders by patient ID,
            order ID, or prescription ID. No patient directory.{" "}
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/refill-requests")}
            >
              Open refill queue
            </button>
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          {error && (
            <div className="auth-error" style={{ margin: "20px 30px 0" }}>
              {error}
            </div>
          )}
          {success && (
            <div
              className="auth-success"
              style={{ margin: "20px 30px 0" }}
            >
              {success}
            </div>
          )}

          <section className="patient-details-section">
            <h3>Lookup</h3>
            <div className="patient-edit-grid">
              <form onSubmit={handleLookupPatient}>
                <div className="form-group">
                  <label>Patient ID</label>
                  <input
                    type="number"
                    min={1}
                    value={patientIdInput}
                    onChange={(e) =>
                      setPatientIdInput(e.target.value)
                    }
                    placeholder="e.g. 1"
                  />
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  Load by Patient ID
                </button>
              </form>

              <form onSubmit={handleLookupOrder}>
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) =>
                      setOrderIdInput(e.target.value)
                    }
                    placeholder="e.g. 12 or ORD-1786448939375"
                  />
                </div>
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={loading}
                >
                  Load by Order ID
                </button>
              </form>

              <form onSubmit={handleLookupPrescription}>
                <div className="form-group">
                  <label>Prescription ID</label>
                  <input
                    type="number"
                    min={1}
                    value={prescriptionIdInput}
                    onChange={(e) =>
                      setPrescriptionIdInput(e.target.value)
                    }
                    placeholder="e.g. 5"
                  />
                </div>
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={loading}
                >
                  Load by Prescription ID
                </button>
              </form>
            </div>
          </section>

          {loading && (
            <div className="loading">Loading pharmacy data...</div>
          )}

          {!loading && activePatientId !== null && (
            <>
              <section className="patient-details-section">
                <h3>Patient #{activePatientId}</h3>
                <p className="section-description">
                  Demographics are not available to pharmacists.
                  Status updates only.
                </p>
              </section>

              <section className="patient-details-section">
                <h3>Prescriptions</h3>
                {prescriptions.length === 0 ? (
                  <div className="empty-state">
                    No prescriptions found.
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Prescription</th>
                          <th>Status</th>
                          <th>Prescribed</th>
                          <th>Update Status</th>
                          <th>Refill</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map((rx) => (
                          <tr key={rx.id}>
                            <td>
                              <strong>{rx.prescriptionNo}</strong>
                              <small>ID: {rx.id}</small>
                            </td>
                            <td>
                              <span className="status-badge">
                                {rx.status}
                              </span>
                            </td>
                            <td>
                              {new Date(
                                rx.prescribedAt
                              ).toLocaleString()}
                            </td>
                            <td>
                              <select
                                className="document-type-select"
                                value={rx.status}
                                onChange={(e) =>
                                  updatePrescriptionStatus(
                                    rx.id,
                                    e.target.value
                                  )
                                }
                              >
                                {RX_STATUSES.map((status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="secondary-button"
                                disabled={rx.status !== "ACTIVE"}
                                onClick={() => requestRefill(rx.id)}
                              >
                                Request refill
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="patient-details-section">
                <h3>Orders</h3>
                {orders.length === 0 ? (
                  <div className="empty-state">No orders found.</div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>
                                {order.orderNo || `#${order.id}`}
                              </strong>
                              <small>ID: {order.id}</small>
                            </td>
                            <td>
                              <span className="status-badge">
                                {order.status}
                              </span>
                            </td>
                            <td>{order.paymentStatus}</td>
                            <td>
                              <div className="document-actions">
                                <select
                                  className="document-type-select"
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(
                                      order.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  {ORDER_STATUSES.map(
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
                                <select
                                  className="document-type-select"
                                  value={order.paymentStatus}
                                  onChange={(e) =>
                                    updatePaymentStatus(
                                      order.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  {PAYMENT_STATUSES.map(
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default PharmacyWorkspace;
