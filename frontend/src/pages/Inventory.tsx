import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Medication {
  id: number;
  sku: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  status: string;
  stockStatus: string;
}

interface StockMovement {
  id: number;
  movementType: string;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason?: string | null;
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
  } | null;
}

function Inventory() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    sku: "",
    name: "",
    unit: "tablet",
    quantityOnHand: "0",
    reorderLevel: "10",
    reorderQuantity: "50",
  });

  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [busy, setBusy] = useState(false);

  const [historyId, setHistoryId] = useState<number | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (stockStatusFilter !== "ALL") {
        params.set("stockStatus", stockStatusFilter);
      }
      if (search.trim()) {
        params.set("q", search.trim());
      }

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(
        `http://localhost:4000/api/medications${query}`,
        { headers: authHeaders() }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load inventory");
      }
      setMedications(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, [stockStatusFilter, statusFilter]);

  const createMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch("http://localhost:4000/api/medications", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          sku: createForm.sku.trim(),
          name: createForm.name.trim(),
          unit: createForm.unit.trim(),
          quantityOnHand: Number(createForm.quantityOnHand),
          reorderLevel: Number(createForm.reorderLevel),
          reorderQuantity: Number(createForm.reorderQuantity),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create medication");
      }

      setSuccess(`Created ${result.data.sku}`);
      setShowCreate(false);
      setCreateForm({
        sku: "",
        name: "",
        unit: "tablet",
        quantityOnHand: "0",
        reorderLevel: "10",
        reorderQuantity: "50",
      });
      await loadMedications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create medication"
      );
    } finally {
      setBusy(false);
    }
  };

  const submitAdjust = async (medication: Medication) => {
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:4000/api/medications/${medication.id}/adjust`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            delta: Number(adjustDelta),
            reason: adjustReason.trim(),
          }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to adjust stock");
      }

      setSuccess(`Adjusted stock for ${medication.sku}`);
      setAdjustId(null);
      setAdjustDelta("");
      setAdjustReason("");
      await loadMedications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to adjust stock"
      );
    } finally {
      setBusy(false);
    }
  };

  const requestReplenishment = async (medication: Medication) => {
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const qty =
        medication.reorderQuantity > 0
          ? medication.reorderQuantity
          : 1;

      const response = await fetch(
        "http://localhost:4000/api/replenishment-requests",
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            medicationId: medication.id,
            requestedQuantity: qty,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create replenishment request"
        );
      }

      setSuccess(
        `Replenishment ${result.data.requestNo} submitted for ${medication.sku}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create replenishment request"
      );
    } finally {
      setBusy(false);
    }
  };

  const loadHistory = async (medicationId: number) => {
    try {
      setHistoryId(medicationId);
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/medications/${medicationId}/movements?limit=20`,
        { headers: authHeaders() }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load movements");
      }
      setMovements(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load movements"
      );
      setMovements([]);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Inventory</h1>
          <p>
            Medication catalog, stock levels, and controlled adjustments.
            Orders do not auto-change stock in this release.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/replenishment-requests")}
          >
            Replenishment queue
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
        <div className="patients-card">
          <section className="patient-details-section">
            <div className="section-heading-row">
              <div>
                <h3>Filters</h3>
                <p className="section-description">
                  Find low or out-of-stock items and manage catalog entries.
                </p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowCreate((prev) => !prev)}
              >
                {showCreate ? "Close" : "+ Add medication"}
              </button>
            </div>

            <div className="patient-edit-grid">
              <div className="form-group">
                <label>Stock status</label>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="IN_STOCK">IN_STOCK</option>
                  <option value="LOW_STOCK">LOW_STOCK</option>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                </select>
              </div>
              <div className="form-group">
                <label>Catalog status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
              <div className="form-group">
                <label>Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or SKU"
                />
              </div>
            </div>
            <div className="audit-filter-actions">
              <button
                type="button"
                className="primary-button"
                onClick={loadMedications}
              >
                Apply search
              </button>
            </div>

            {showCreate && (
              <form
                className="dependent-form"
                onSubmit={createMedication}
                style={{ marginTop: "20px" }}
              >
                <div className="patient-edit-grid">
                  <div className="form-group">
                    <label>SKU</label>
                    <input
                      required
                      value={createForm.sku}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          sku: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      required
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input
                      required
                      value={createForm.unit}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial qty</label>
                    <input
                      type="number"
                      min={0}
                      value={createForm.quantityOnHand}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          quantityOnHand: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Reorder level</label>
                    <input
                      type="number"
                      min={0}
                      value={createForm.reorderLevel}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          reorderLevel: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Reorder quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={createForm.reorderQuantity}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          reorderQuantity: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="audit-filter-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busy}
                  >
                    Create medication
                  </button>
                </div>
              </form>
            )}
          </section>

          {error && (
            <div className="auth-error" style={{ margin: "0 30px 20px" }}>
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                margin: "0 30px 20px",
                color: "#0f766e",
                fontWeight: 600,
              }}
            >
              {success}
            </div>
          )}

          <section className="patient-details-section">
            <div className="section-heading-row">
              <div>
                <h3>Medications</h3>
                <p className="section-description">
                  {medications.length} item(s) in current view
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading inventory…</div>
            ) : medications.length === 0 ? (
              <div className="empty-state">No medications found.</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Reorder</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med.id}>
                        <td>
                          <strong>{med.sku}</strong>
                          <small>{med.unit}</small>
                        </td>
                        <td>{med.name}</td>
                        <td>{med.quantityOnHand}</td>
                        <td>
                          Level {med.reorderLevel}
                          <small>Suggest {med.reorderQuantity}</small>
                        </td>
                        <td>
                          <span className="status-badge">
                            {med.stockStatus}
                          </span>
                          <small>{med.status}</small>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              minWidth: "220px",
                            }}
                          >
                            {adjustId === med.id ? (
                              <>
                                <input
                                  type="number"
                                  placeholder="Delta (+/-)"
                                  value={adjustDelta}
                                  onChange={(e) =>
                                    setAdjustDelta(e.target.value)
                                  }
                                />
                                <input
                                  placeholder="Reason (required)"
                                  value={adjustReason}
                                  onChange={(e) =>
                                    setAdjustReason(e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  className="primary-button"
                                  disabled={busy}
                                  onClick={() => submitAdjust(med)}
                                >
                                  Save adjust
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => setAdjustId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="primary-button"
                                  disabled={busy || med.status !== "ACTIVE"}
                                  onClick={() => {
                                    setAdjustId(med.id);
                                    setAdjustDelta("");
                                    setAdjustReason("");
                                  }}
                                >
                                  Adjust stock
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  disabled={busy || med.status !== "ACTIVE"}
                                  onClick={() => requestReplenishment(med)}
                                >
                                  Request replenishment
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => loadHistory(med.id)}
                                >
                                  History
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {historyId !== null && (
              <div style={{ marginTop: "24px" }}>
                <h3>Recent movements</h3>
                {movements.length === 0 ? (
                  <p>No movements.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Type</th>
                          <th>Delta</th>
                          <th>Before → After</th>
                          <th>Reason</th>
                          <th>Actor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((m) => (
                          <tr key={m.id}>
                            <td>
                              {new Date(m.createdAt).toLocaleString()}
                            </td>
                            <td>{m.movementType}</td>
                            <td>{m.quantityDelta}</td>
                            <td>
                              {m.quantityBefore} → {m.quantityAfter}
                            </td>
                            <td>{m.reason || "—"}</td>
                            <td>
                              {m.actor
                                ? `${m.actor.firstName} ${m.actor.lastName}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Inventory;
