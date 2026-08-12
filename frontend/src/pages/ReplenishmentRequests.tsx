import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ReplenishmentRequest {
  id: number;
  requestNo: string;
  medicationId: number;
  requestedQuantity: number;
  receivedQuantity?: number | null;
  status: string;
  notes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  medication?: {
    sku: string;
    name: string;
    quantityOnHand: number;
    stockStatus?: string;
  };
}

function ReplenishmentRequests() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const role = user?.role?.toUpperCase() || "";
  const isAdmin = role === "ADMIN";

  const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>(
    {}
  );
  const [receiveQtys, setReceiveQtys] = useState<Record<number, string>>({});

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const query =
        statusFilter && statusFilter !== "ALL"
          ? `?status=${statusFilter}`
          : "";

      const response = await fetch(
        `http://localhost:4000/api/replenishment-requests${query}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load replenishment requests"
        );
      }
      setRequests(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load replenishment requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const updateStatus = async (
    request: ReplenishmentRequest,
    status: "APPROVED" | "REJECTED" | "CANCELLED" | "RECEIVED"
  ) => {
    try {
      setBusyId(request.id);
      setError("");
      setSuccess("");

      const body: {
        status: string;
        rejectionReason?: string;
        receivedQuantity?: number;
      } = { status };

      if (status === "REJECTED") {
        const reason = (rejectReasons[request.id] || "").trim();
        if (!reason) {
          setError("Rejection reason is required.");
          setBusyId(null);
          return;
        }
        body.rejectionReason = reason;
      }

      if (status === "RECEIVED") {
        const raw = receiveQtys[request.id];
        if (raw !== undefined && raw !== "") {
          body.receivedQuantity = Number(raw);
        }
      }

      const response = await fetch(
        `http://localhost:4000/api/replenishment-requests/${request.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update request");
      }

      setSuccess(`Request ${request.requestNo} marked ${status}.`);
      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update request"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Replenishment Requests</h1>
          <p>
            Pharmacists request stock. Admins approve. Receiving increases
            on-hand quantity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/inventory")}
          >
            Inventory
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
          <div className="form-group">
            <label>Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="ALL">ALL</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{ color: "#0f766e", fontWeight: 600 }}>{success}</div>
          )}

          {loading ? (
            <p>Loading…</p>
          ) : requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Medication</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.requestNo}</strong>
                      <br />
                      <small>
                        {new Date(request.createdAt).toLocaleString()}
                      </small>
                    </td>
                    <td>
                      {request.medication
                        ? `${request.medication.sku} — ${request.medication.name}`
                        : request.medicationId}
                      {request.medication?.stockStatus && (
                        <>
                          <br />
                          <small>
                            On hand {request.medication.quantityOnHand} (
                            {request.medication.stockStatus})
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      Requested {request.requestedQuantity}
                      {request.receivedQuantity != null && (
                        <>
                          <br />
                          <small>Received {request.receivedQuantity}</small>
                        </>
                      )}
                    </td>
                    <td>{request.status}</td>
                    <td>
                      {request.status === "SUBMITTED" && isAdmin && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            minWidth: "220px",
                          }}
                        >
                          <button
                            className="primary-button"
                            disabled={busyId === request.id}
                            onClick={() => updateStatus(request, "APPROVED")}
                          >
                            Approve
                          </button>
                          <input
                            placeholder="Rejection reason"
                            value={rejectReasons[request.id] || ""}
                            onChange={(e) =>
                              setRejectReasons((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="secondary-button"
                            disabled={busyId === request.id}
                            onClick={() => updateStatus(request, "REJECTED")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === "SUBMITTED" && (
                        <button
                          className="secondary-button"
                          style={{ marginTop: "8px" }}
                          disabled={busyId === request.id}
                          onClick={() => updateStatus(request, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      )}
                      {request.status === "APPROVED" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            minWidth: "220px",
                          }}
                        >
                          <input
                            type="number"
                            min={1}
                            placeholder={`Qty (default ${request.requestedQuantity})`}
                            value={receiveQtys[request.id] || ""}
                            onChange={(e) =>
                              setReceiveQtys((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="primary-button"
                            disabled={busyId === request.id}
                            onClick={() => updateStatus(request, "RECEIVED")}
                          >
                            Receive stock
                          </button>
                        </div>
                      )}
                      {request.rejectionReason && (
                        <small>Reason: {request.rejectionReason}</small>
                      )}
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

export default ReplenishmentRequests;
