import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LabOrder {
  id: number;
  orderNo: string;
  testName: string;
  status: string;
  orderedAt: string;
  resultFlag?: string | null;
  hasResultFile?: boolean;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

function MyLabOrders() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState<LabOrder[]>([]);
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
        const response = await fetch("http://localhost:4000/api/lab-orders", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load lab orders");
        }
        setOrders(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load lab orders"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Lab Results</h1>
          <p>
            Track your lab orders. Result details appear after your doctor
            acknowledges them.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card" style={{ padding: "20px 30px" }}>
          {error && <div className="auth-error">{error}</div>}

          {loading ? (
            <p>Loading…</p>
          ) : orders.length === 0 ? (
            <p>No lab orders yet.</p>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Order</th>
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
                    <td>{order.testName}</td>
                    <td>
                      {order.doctor
                        ? `Dr. ${order.doctor.firstName} ${order.doctor.lastName}`
                        : "—"}
                    </td>
                    <td>
                      {order.status}
                      {order.status === "RESULT_AVAILABLE" && (
                        <>
                          <br />
                          <small>Awaiting doctor review</small>
                        </>
                      )}
                      {order.status === "ACKNOWLEDGED" && order.resultFlag && (
                        <>
                          <br />
                          <small>{order.resultFlag}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(`/my/lab-orders/${order.id}`)}
                      >
                        View
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

export default MyLabOrders;
