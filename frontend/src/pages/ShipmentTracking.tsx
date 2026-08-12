/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  totalAmount?: number | string;
  items?: OrderItem[];
}

function buildTrackingNumber(order: Order) {
  const seed = order.orderNo || `ORD${order.id}`;
  const digits = seed.replace(/\D/g, "").slice(-8).padStart(8, "0");
  return `HOX${digits}${String(order.id).padStart(4, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function ShipmentTracking() {
  const { orderId } = useParams();
  const { token, user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      const id = Number(orderId);
      if (Number.isNaN(id)) {
        setError("Invalid order ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:4000/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load order"
          );
        }

        const data = result.data as Order;

        if (
          user?.patientId != null &&
          data.patientId !== user.patientId
        ) {
          throw new Error(
            "You do not have permission to view this shipment."
          );
        }

        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load shipment"
        );
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, user?.patientId]);

  const tracking = useMemo(() => {
    if (!order) {
      return null;
    }

    const orderedAt = order.orderDate
      ? new Date(order.orderDate)
      : new Date();

    const status = (order.status || "").toUpperCase();
    const trackingNumber = buildTrackingNumber(order);

    const steps = [
      {
        key: "PENDING",
        label: "Order placed",
        at: orderedAt,
        done: true,
      },
      {
        key: "CONFIRMED",
        label: "Order confirmed",
        at: addDays(orderedAt, 0),
        done: [
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
        ].includes(status),
      },
      {
        key: "PROCESSING",
        label: "Packed at pharmacy hub",
        at: addDays(orderedAt, 1),
        done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(
          status
        ),
      },
      {
        key: "SHIPPED",
        label: "In transit with HealthOps Courier",
        at: addDays(orderedAt, 2),
        done: ["SHIPPED", "DELIVERED"].includes(status),
      },
      {
        key: "DELIVERED",
        label: "Delivered",
        at: addDays(orderedAt, 4),
        done: status === "DELIVERED",
      },
    ];

    let headline = "Shipment is being prepared";
    let eta = addDays(orderedAt, 4);

    if (status === "CANCELLED") {
      headline = "Shipment cancelled";
    } else if (status === "DELIVERED") {
      headline = "Package delivered";
      eta = addDays(orderedAt, 4);
    } else if (status === "SHIPPED") {
      headline = "Package in transit";
      eta = addDays(orderedAt, 4);
    } else if (status === "PROCESSING") {
      headline = "Package packed — awaiting carrier pickup";
      eta = addDays(orderedAt, 4);
    }

    return {
      trackingNumber,
      carrier: "HealthOps Courier (demo)",
      service: "Standard Pharmacy Delivery",
      headline,
      eta,
      steps,
      status,
    };
  }, [order]);

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Shipment Tracking</h1>
          <p>
            Demo tracking details derived from your order
            (no external carrier integration).
          </p>
        </div>
        <Link to="/my/orders" className="secondary-button">
          ← Back to My Orders
        </Link>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          {loading && (
            <div className="loading" style={{ padding: 24 }}>
              Loading shipment...
            </div>
          )}

          {!loading && error && (
            <div className="auth-error" style={{ margin: 24 }}>
              {error}
            </div>
          )}

          {!loading && order && tracking && (
            <section className="patient-details-section">
              <div className="section-heading-row">
                <div>
                  <h3>
                    {order.orderNo || `Order #${order.id}`}
                  </h3>
                  <p className="section-description">
                    {tracking.headline}
                  </p>
                </div>
                <span className="status-badge">
                  {tracking.status}
                </span>
              </div>

              <div className="patient-edit-grid shipment-meta-grid">
                <div className="form-group">
                  <label>Tracking number</label>
                  <div className="shipment-value">
                    {tracking.trackingNumber}
                  </div>
                </div>
                <div className="form-group">
                  <label>Carrier</label>
                  <div className="shipment-value">
                    {tracking.carrier}
                  </div>
                </div>
                <div className="form-group">
                  <label>Service</label>
                  <div className="shipment-value">
                    {tracking.service}
                  </div>
                </div>
                <div className="form-group">
                  <label>Estimated delivery</label>
                  <div className="shipment-value">
                    {tracking.status === "CANCELLED"
                      ? "—"
                      : tracking.eta.toLocaleDateString()}
                  </div>
                </div>
                <div className="form-group">
                  <label>Ship to</label>
                  <div className="shipment-value">
                    {order.deliveryAddress?.trim() ||
                      "Address on file / pickup"}
                  </div>
                </div>
                <div className="form-group">
                  <label>Payment</label>
                  <div className="shipment-value">
                    {order.paymentStatus}
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: 28 }}>Tracking timeline</h3>
              <ul className="shipment-timeline">
                {tracking.steps.map((step) => (
                  <li
                    key={step.key}
                    className={
                      step.done
                        ? "shipment-step shipment-step-done"
                        : "shipment-step"
                    }
                  >
                    <div className="shipment-step-dot" />
                    <div>
                      <strong>{step.label}</strong>
                      <div className="shipment-step-time">
                        {step.done
                          ? step.at.toLocaleString()
                          : "Pending"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {order.items && order.items.length > 0 && (
                <>
                  <h3 style={{ marginTop: 28 }}>Package contents</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={`${item.productName}-${index}`}>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="patient-details-actions" style={{ marginTop: 24 }}>
                <Link to="/my/orders" className="primary-button">
                  Return to My Orders
                </Link>
                <Link to="/dashboard" className="secondary-button">
                  Go to Dashboard
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default ShipmentTracking;
