/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LabOrderDetail {
  id: number;
  orderNo: string;
  testName: string;
  status: string;
  orderedAt: string;
  notes?: string | null;
  resultSummary?: string | null;
  resultFlag?: string | null;
  hasResultFile?: boolean;
  acknowledgedAt?: string | null;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

function MyLabOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState<LabOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load lab order"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
        throw new Error(result?.message || "Result file is not available yet");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${order?.orderNo || "lab"}-result`;
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
              onClick={() => navigate("/my/lab-orders")}
            >
              Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const resultVisible = order.status === "ACKNOWLEDGED";

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
          onClick={() => navigate("/my/lab-orders")}
        >
          ← My lab results
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          {error && <div className="auth-error">{error}</div>}

          <section className="patient-details-section">
            <h3>Order</h3>
            <p>
              <strong>Test:</strong> {order.testName}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Ordered:</strong>{" "}
              {new Date(order.orderedAt).toLocaleString()}
            </p>
            <p>
              <strong>Doctor:</strong>{" "}
              {order.doctor
                ? `Dr. ${order.doctor.firstName} ${order.doctor.lastName}`
                : "—"}
            </p>
            {order.notes && (
              <p>
                <strong>Notes:</strong> {order.notes}
              </p>
            )}
          </section>

          <section
            className="patient-details-section"
            style={{ marginTop: "20px" }}
          >
            <h3>Result</h3>
            {!resultVisible && (
              <p>
                {order.status === "RESULT_AVAILABLE"
                  ? "Your result is ready and awaiting doctor acknowledgment. Details will appear here after review."
                  : "Result details are not available yet."}
              </p>
            )}
            {resultVisible && (
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
                {order.acknowledgedAt && (
                  <p>
                    <strong>Acknowledged:</strong>{" "}
                    {new Date(order.acknowledgedAt).toLocaleString()}
                  </p>
                )}
                {order.hasResultFile && (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={downloadResult}
                  >
                    Download result file
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyLabOrderDetails;
