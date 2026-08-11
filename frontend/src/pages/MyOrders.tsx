import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderNo?: string;
  patientId: number;
  status: string;
  paymentStatus: string;
  deliveryAddress?: string | null;
  notes?: string | null;
  orderDate?: string;
  items?: OrderItem[];
}

function MyOrders() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const patientId = user?.patientId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { productName: "", quantity: 1, unitPrice: 0 },
  ]);

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadOrders = async () => {
    if (!patientId) {
      setLoading(false);
      setError(
        "No patient record is linked to this account."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:4000/api/orders/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load orders"
        );
      }

      setOrders(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [patientId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      return;
    }

    const validItems = items.every(
      (item) =>
        item.productName.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0
    );

    if (!validItems) {
      setError(
        "Provide product name, quantity and price for every item."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:4000/api/orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            deliveryAddress:
              deliveryAddress.trim() || undefined,
            notes: notes.trim() || undefined,
            items: items.map((item) => ({
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
        result.message || "Order created successfully."
      );
      setShowForm(false);
      setDeliveryAddress("");
      setNotes("");
      setItems([{ productName: "", quantity: 1, unitPrice: 0 }]);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create order"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>My Orders</h1>
          <p>View and create pharmacy orders for your account.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
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
            <div className="section-heading-row">
              <div>
                <h3>Orders</h3>
                <p className="section-description">
                  Status updates are handled by pharmacy staff.
                </p>
              </div>
              {patientId && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setShowForm((prev) => !prev);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {showForm ? "Close" : "+ Create Order"}
                </button>
              )}
            </div>

            {showForm && (
              <form className="dependent-form" onSubmit={handleCreate}>
                <div className="patient-edit-grid">
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) =>
                        setDeliveryAddress(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {items.map((item, index) => (
                  <div className="patient-edit-grid" key={index}>
                    <div className="form-group">
                      <label>Product</label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => {
                          const next = [...items];
                          next[index] = {
                            ...next[index],
                            productName: e.target.value,
                          };
                          setItems(next);
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...items];
                          next[index] = {
                            ...next[index],
                            quantity: Number(e.target.value),
                          };
                          setItems(next);
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit Price</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const next = [...items];
                          next[index] = {
                            ...next[index],
                            unitPrice: Number(e.target.value),
                          };
                          setItems(next);
                        }}
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="patient-details-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setItems((prev) => [
                        ...prev,
                        {
                          productName: "",
                          quantity: 1,
                          unitPrice: 0,
                        },
                      ])
                    }
                  >
                    + Add Item
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Submit Order"}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-state">No orders found.</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Items</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>
                            {order.orderNo || `#${order.id}`}
                          </strong>
                        </td>
                        <td>
                          <span className="status-badge">
                            {order.status}
                          </span>
                        </td>
                        <td>{order.paymentStatus}</td>
                        <td>{order.items?.length ?? 0}</td>
                        <td>
                          {order.orderDate
                            ? new Date(
                                order.orderDate
                              ).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyOrders;
