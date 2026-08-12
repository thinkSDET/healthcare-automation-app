import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LabOrderDetail {
  id: number;
  orderNo: string;
  patientId: number;
  doctorId: number;
  testName: string;
  status: string;
  orderedAt: string;
  notes?: string | null;
  rejectionReason?: string | null;
  resultSummary?: string | null;
  resultFlag?: string | null;
  resultOriginalName?: string | null;
  resultFilePath?: string | null;
  resultDocumentId?: number | null;
  acknowledgedAt?: string | null;
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
  acknowledgedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

function LabOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const role = user?.role?.toUpperCase() || "";
  const isAdmin = role === "ADMIN";
  const isDoctorOrAdmin = role === "ADMIN" || role === "DOCTOR";

  const [order, setOrder] = useState<LabOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [resultSummary, setResultSummary] = useState("");
  const [resultFlag, setResultFlag] = useState("NORMAL");
  const [resultFile, setResultFile] = useState<File | null>(null);

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/lab-orders/${id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load lab order");
      }
      setOrder(result.data);
      if (result.data.resultSummary) {
        setResultSummary(result.data.resultSummary);
      }
      if (result.data.resultFlag) {
        setResultFlag(result.data.resultFlag);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lab order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const patchStatus = async (status: string) => {
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const body: { status: string; rejectionReason?: string } = { status };
      if (status === "REJECTED") {
        const reason = rejectReason.trim();
        if (!reason) {
          setError("Rejection reason is required.");
          setBusy(false);
          return;
        }
        body.rejectionReason = reason;
      }

      const response = await fetch(
        `http://localhost:4000/api/lab-orders/${id}/status`,
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
        throw new Error(result.message || "Failed to update status");
      }
      setSuccess(`Status updated to ${status}`);
      setOrder(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const uploadResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("resultSummary", resultSummary.trim());
      formData.append("resultFlag", resultFlag);
      if (resultFile) {
        formData.append("document", resultFile);
      }

      const response = await fetch(
        `http://localhost:4000/api/lab-orders/${id}/result`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload result");
      }
      setSuccess("Result uploaded");
      setOrder(result.data);
      setResultFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload result");
    } finally {
      setBusy(false);
    }
  };

  const acknowledge = async () => {
    try {
      setBusy(true);
      setError("");
      setSuccess("");
      const response = await fetch(
        `http://localhost:4000/api/lab-orders/${id}/acknowledge`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to acknowledge result");
      }
      setSuccess("Result acknowledged — patient may now view it");
      setOrder(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to acknowledge result"
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadResult = async () => {
    try {
      setError("");
      const response = await fetch(
        `http://localhost:4000/api/lab-orders/${id}/result-document/download`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to download result file");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        order?.resultOriginalName || `${order?.orderNo || "lab"}-result`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download result file"
      );
    }
  };

  if (loading) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <p>Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <p>{error || "Lab order not found"}</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/lab-orders")}
            >
              Back to lab orders
            </button>
          </div>
        </main>
      </div>
    );
  }

  const canCollect = isAdmin && order.status === "REQUESTED";
  const canProcess =
    isAdmin &&
    (order.status === "SAMPLE_COLLECTED" || order.status === "REJECTED");
  const canCancel =
    isDoctorOrAdmin &&
    (order.status === "REQUESTED" || order.status === "SAMPLE_COLLECTED");
  const canUploadResult =
    isAdmin &&
    (order.status === "PROCESSING" || order.status === "RESULT_AVAILABLE");
  const canAcknowledge =
    isDoctorOrAdmin && order.status === "RESULT_AVAILABLE";
  const canReject = canAcknowledge;
  const hasFile = Boolean(order.resultFilePath || order.resultDocumentId);

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>{order.orderNo}</h1>
          <p>
            {order.testName} · {order.status}
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/lab-orders")}
        >
          ← Lab orders
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{ color: "#0f766e", fontWeight: 600 }}>{success}</div>
          )}

          <section className="patient-details-section">
            <h3>Order details</h3>
            <p>
              <strong>Patient:</strong>{" "}
              {order.patient
                ? `${order.patient.firstName} ${order.patient.lastName} (${order.patient.medicalId})`
                : order.patientId}
            </p>
            <p>
              <strong>Doctor:</strong>{" "}
              {order.doctor
                ? `Dr. ${order.doctor.firstName} ${order.doctor.lastName} — ${order.doctor.specialization}`
                : order.doctorId}
            </p>
            <p>
              <strong>Ordered:</strong>{" "}
              {new Date(order.orderedAt).toLocaleString()}
            </p>
            {order.notes && (
              <p>
                <strong>Notes:</strong> {order.notes}
              </p>
            )}
            {order.rejectionReason && (
              <p>
                <strong>Rejection reason:</strong> {order.rejectionReason}
              </p>
            )}
            {order.acknowledgedAt && (
              <p>
                <strong>Acknowledged:</strong>{" "}
                {new Date(order.acknowledgedAt).toLocaleString()}
                {order.acknowledgedBy
                  ? ` by ${order.acknowledgedBy.firstName} ${order.acknowledgedBy.lastName}`
                  : ""}
              </p>
            )}
          </section>

          <section
            className="patient-details-section"
            style={{ marginTop: "20px" }}
          >
            <h3>Workflow actions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {canCollect && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={busy}
                  onClick={() => patchStatus("SAMPLE_COLLECTED")}
                >
                  Mark sample collected
                </button>
              )}
              {canProcess && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={busy}
                  onClick={() => patchStatus("PROCESSING")}
                >
                  Mark processing
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => patchStatus("CANCELLED")}
                >
                  Cancel order
                </button>
              )}
              {canAcknowledge && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={busy}
                  onClick={acknowledge}
                >
                  Acknowledge result
                </button>
              )}
            </div>

            {canReject && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxWidth: "420px",
                }}
              >
                <input
                  placeholder="Rejection reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => patchStatus("REJECTED")}
                >
                  Reject result
                </button>
              </div>
            )}
          </section>

          {(order.resultSummary || canUploadResult) && (
            <section
              className="patient-details-section"
              style={{ marginTop: "20px" }}
            >
              <h3>Result</h3>
              {order.resultSummary && (
                <>
                  <p>
                    <strong>Flag:</strong>{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          order.resultFlag === "CRITICAL"
                            ? "#b91c1c"
                            : order.resultFlag === "ABNORMAL"
                              ? "#b45309"
                              : undefined,
                      }}
                    >
                      {order.resultFlag}
                    </span>
                  </p>
                  <p style={{ whiteSpace: "pre-wrap" }}>{order.resultSummary}</p>
                  {hasFile && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={downloadResult}
                    >
                      Download result file
                    </button>
                  )}
                </>
              )}

              {canUploadResult && (
                <form
                  className="dependent-form"
                  onSubmit={uploadResult}
                  style={{ marginTop: "16px" }}
                >
                  <h4>
                    {order.status === "RESULT_AVAILABLE"
                      ? "Replace result"
                      : "Upload result"}
                  </h4>
                  <div className="form-group">
                    <label>Result summary</label>
                    <textarea
                      required
                      rows={4}
                      value={resultSummary}
                      onChange={(e) => setResultSummary(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Result flag</label>
                    <select
                      value={resultFlag}
                      onChange={(e) => setResultFlag(e.target.value)}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="ABNORMAL">ABNORMAL</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Result file (optional)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
                      onChange={(e) =>
                        setResultFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save result"}
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default LabOrderDetails;
