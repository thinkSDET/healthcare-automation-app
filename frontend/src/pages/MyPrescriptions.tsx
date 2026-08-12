/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: number;
  prescriptionNo: string;
  patientId: number;
  status: string;
  prescribedAt: string;
  diagnosis?: string | null;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  items?: PrescriptionItem[];
}

interface RefillRequest {
  id: number;
  requestNo: string;
  prescriptionId: number;
  requestType: string;
  status: string;
  notes?: string | null;
  rejectionReason?: string | null;
  orderId?: number | null;
  createdAt: string;
  prescription?: {
    prescriptionNo: string;
    status: string;
    items?: PrescriptionItem[];
  };
  order?: {
    id: number;
    orderNo: string;
  } | null;
}

function MyPrescriptions() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const patientId = user?.patientId;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [requests, setRequests] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [orderRequestId, setOrderRequestId] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderItems, setOrderItems] = useState<
    Array<{ productName: string; quantity: number; unitPrice: number }>
  >([]);

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadData = async () => {
    if (!patientId) {
      setLoading(false);
      setError("No patient record is linked to this account.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${getToken()}`,
      };

      const [rxRes, reqRes] = await Promise.all([
        fetch(
          `http://localhost:4000/api/prescriptions/patient/${patientId}`,
          { headers }
        ),
        fetch("http://localhost:4000/api/refill-requests", {
          headers,
        }),
      ]);

      const rxResult = await rxRes.json();
      const reqResult = await reqRes.json();

      if (!rxRes.ok || !rxResult.success) {
        throw new Error(
          rxResult.message || "Failed to load prescriptions"
        );
      }
      if (!reqRes.ok || !reqResult.success) {
        throw new Error(
          reqResult.message || "Failed to load refill requests"
        );
      }

      setPrescriptions(rxResult.data || []);
      setRequests(reqResult.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const openRequestExists = (prescriptionId: number) =>
    requests.some(
      (r) =>
        r.prescriptionId === prescriptionId &&
        r.status === "SUBMITTED"
    );

  const submitRequest = async (
    prescription: Prescription,
    requestType: "REFILL" | "RENEWAL"
  ) => {
    try {
      setBusyId(prescription.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/prescriptions/${prescription.id}/refill-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestType }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit request"
        );
      }

      setSuccess(
        `${requestType} request ${result.data.requestNo} submitted.`
      );
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit request"
      );
    } finally {
      setBusyId(null);
    }
  };

  const cancelRequest = async (requestId: number) => {
    try {
      setBusyId(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/refill-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to cancel request"
        );
      }

      setSuccess("Request cancelled.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel request"
      );
    } finally {
      setBusyId(null);
    }
  };

  const startCreateOrder = (request: RefillRequest) => {
    const items =
      request.prescription?.items?.map((item) => ({
        productName: item.medicineName,
        quantity: 1,
        unitPrice: 0,
      })) || [];
    setOrderRequestId(request.id);
    setOrderItems(
      items.length
        ? items
        : [{ productName: "", quantity: 1, unitPrice: 0 }]
    );
    setDeliveryAddress("");
    setOrderNotes("");
    setError("");
    setSuccess("");
  };

  const submitCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRequestId) {
      return;
    }

    const valid = orderItems.every(
      (item) =>
        item.productName.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0
    );
    if (!valid) {
      setError("Provide product name, quantity, and price for every item.");
      return;
    }

    try {
      setBusyId(orderRequestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/refill-requests/${orderRequestId}/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryAddress: deliveryAddress.trim() || undefined,
            notes: orderNotes.trim() || undefined,
            items: orderItems.map((item) => ({
              productName: item.productName.trim(),
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            })),
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create order"
        );
      }

      setSuccess(
        `Order ${result.data.order?.orderNo || ""} created from request.`
      );
      setOrderRequestId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create order"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Prescriptions</h1>
          <p>
            Request a refill for an active prescription, or a renewal when
            clinical re-authorization is needed. Approval does not change
            prescription status; create an order after approval.
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
              style={{
                margin: "20px 30px 0",
                color: "#0f766e",
                fontWeight: 600,
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <p style={{ padding: "30px" }}>Loading…</p>
          ) : (
            <>
              <section style={{ padding: "20px 30px" }}>
                <h2>Prescriptions</h2>
                {prescriptions.length === 0 ? (
                  <p>No prescriptions found.</p>
                ) : (
                  <table className="patients-table">
                    <thead>
                      <tr>
                        <th>Rx</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Medicines</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx) => {
                        const canRefill =
                          rx.status === "ACTIVE" &&
                          !openRequestExists(rx.id);
                        const canRenew =
                          (rx.status === "ACTIVE" ||
                            rx.status === "COMPLETED") &&
                          !openRequestExists(rx.id);

                        return (
                          <tr key={rx.id}>
                            <td>
                              <strong>{rx.prescriptionNo}</strong>
                            </td>
                            <td>
                              {rx.doctor
                                ? `Dr. ${rx.doctor.firstName} ${rx.doctor.lastName}`
                                : "—"}
                            </td>
                            <td>{rx.status}</td>
                            <td>
                              {(rx.items || [])
                                .map((i) => i.medicineName)
                                .join(", ") || "—"}
                            </td>
                            <td>
                              <button
                                className="secondary-button"
                                disabled={!canRefill || busyId === rx.id}
                                onClick={() =>
                                  submitRequest(rx, "REFILL")
                                }
                              >
                                Request refill
                              </button>{" "}
                              <button
                                className="secondary-button"
                                disabled={!canRenew || busyId === rx.id}
                                onClick={() =>
                                  submitRequest(rx, "RENEWAL")
                                }
                              >
                                Request renewal
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>

              <section style={{ padding: "20px 30px" }}>
                <h2>My refill / renewal requests</h2>
                {requests.length === 0 ? (
                  <p>No requests yet.</p>
                ) : (
                  <table className="patients-table">
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Type</th>
                        <th>Rx</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <strong>{req.requestNo}</strong>
                          </td>
                          <td>{req.requestType}</td>
                          <td>
                            {req.prescription?.prescriptionNo ||
                              req.prescriptionId}
                          </td>
                          <td>
                            {req.status}
                            {req.rejectionReason
                              ? ` — ${req.rejectionReason}`
                              : ""}
                          </td>
                          <td>
                            {req.status === "SUBMITTED" && (
                              <button
                                className="secondary-button"
                                disabled={busyId === req.id}
                                onClick={() => cancelRequest(req.id)}
                              >
                                Cancel
                              </button>
                            )}
                            {req.status === "APPROVED" && !req.orderId && (
                              <button
                                className="primary-button"
                                disabled={busyId === req.id}
                                onClick={() => startCreateOrder(req)}
                              >
                                Create order
                              </button>
                            )}
                            {req.orderId && (
                              <Link to="/my/orders">
                                View orders
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {orderRequestId && (
                <section style={{ padding: "20px 30px" }}>
                  <h2>Create order from approved request</h2>
                  <form onSubmit={submitCreateOrder}>
                    <div className="form-group">
                      <label>Delivery address</label>
                      <input
                        value={deliveryAddress}
                        onChange={(e) =>
                          setDeliveryAddress(e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <input
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <input
                          placeholder="Product"
                          value={item.productName}
                          onChange={(e) => {
                            const next = [...orderItems];
                            next[index] = {
                              ...next[index],
                              productName: e.target.value,
                            };
                            setOrderItems(next);
                          }}
                        />
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const next = [...orderItems];
                            next[index] = {
                              ...next[index],
                              quantity: Number(e.target.value),
                            };
                            setOrderItems(next);
                          }}
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Unit price"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const next = [...orderItems];
                            next[index] = {
                              ...next[index],
                              unitPrice: Number(e.target.value),
                            };
                            setOrderItems(next);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={busyId === orderRequestId}
                    >
                      Submit order
                    </button>{" "}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setOrderRequestId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyPrescriptions;
