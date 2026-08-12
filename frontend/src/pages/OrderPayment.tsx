/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Order {
  id: number;
  orderNo?: string;
  patientId: number;
  status: string;
  paymentStatus: string;
  totalAmount?: number | string;
  deliveryAddress?: string | null;
}

function OrderPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentState, setPaymentState] = useState<
    "idle" | "persisting" | "success" | "failed"
  >("idle");

  const persistingRef = useRef(false);

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
            "You do not have permission to pay for this order."
          );
        }

        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load order"
        );
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, user?.patientId]);

  const persistPaymentStatus = async (
    nextStatus: "PAID" | "FAILED",
    iframeMessage: string
  ) => {
    if (!order || persistingRef.current) {
      return;
    }

    persistingRef.current = true;
    setPaymentState("persisting");
    setPaymentMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/orders/${order.id}/payment-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save payment status. Please try again."
        );
      }

      const updated = result.data as Order;
      setOrder(updated);

      if (nextStatus === "PAID") {
        setPaymentState("success");
        setPaymentMessage(
          iframeMessage ||
            "Payment completed successfully and saved."
        );
      } else {
        setPaymentState("failed");
        setPaymentMessage(
          iframeMessage ||
            "Payment failed. You can try again."
        );
      }
    } catch (err) {
      setPaymentState("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save payment status. Please try again."
      );
    } finally {
      persistingRef.current = false;
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data;
      if (!data || data.source !== "healthops-payment") {
        return;
      }

      if (data.type === "payment-success") {
        void persistPaymentStatus(
          "PAID",
          data.message || "Payment completed successfully."
        );
      }

      if (data.type === "payment-failed") {
        void persistPaymentStatus(
          "FAILED",
          data.message || "Payment failed. Please try again."
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [order]);

  const amountLabel = useMemo(() => {
    if (!order) {
      return "0.00";
    }
    const value = Number(order.totalAmount ?? 0);
    return Number.isNaN(value) ? "0.00" : value.toFixed(2);
  }, [order]);

  const iframeSrc = useMemo(() => {
    if (!order) {
      return "";
    }

    const params = new URLSearchParams({
      orderId: String(order.id),
      orderNo: order.orderNo || `Order #${order.id}`,
      amount: amountLabel,
    });

    return `/payment-embed?${params.toString()}`;
  }, [order, amountLabel]);

  const alreadyPaid =
    (order?.paymentStatus || "").toUpperCase() === "PAID";

  const showIframe =
    !alreadyPaid &&
    paymentState !== "success" &&
    paymentState !== "persisting";

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Make Payment</h1>
          <p>
            Complete a demo card payment for your order. No real
            payment provider is used.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/my/orders")}
        >
          ← Back to My Orders
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          {loading && (
            <div className="loading" style={{ padding: 24 }}>
              Loading order...
            </div>
          )}

          {!loading && error && (
            <div className="auth-error" style={{ margin: 24 }}>
              {error}
            </div>
          )}

          {!loading && order && (
            <section className="patient-details-section">
              <div className="section-heading-row">
                <div>
                  <h3>{order.orderNo || `Order #${order.id}`}</h3>
                  <p className="section-description">
                    Amount due: <strong>${amountLabel}</strong> ·
                    Current payment status:{" "}
                    <strong>{order.paymentStatus}</strong>
                  </p>
                </div>
              </div>

              {paymentState === "persisting" && (
                <div className="loading" style={{ marginBottom: 16 }}>
                  Saving payment result...
                </div>
              )}

              {paymentState === "success" && (
                <div className="auth-success" style={{ marginBottom: 16 }}>
                  {paymentMessage}
                </div>
              )}

              {paymentState === "failed" && (
                <div className="auth-error" style={{ marginBottom: 16 }}>
                  {paymentMessage}
                </div>
              )}

              {alreadyPaid && paymentState !== "success" ? (
                <div className="empty-state">
                  This order is already marked as PAID.
                </div>
              ) : null}

              {showIframe && (
                <div className="payment-iframe-shell">
                  <iframe
                    title="Order payment form"
                    className="payment-iframe"
                    src={iframeSrc}
                  />
                </div>
              )}

              <div
                className="patient-details-actions"
                style={{ marginTop: 20 }}
              >
                <Link to="/my/orders" className="primary-button">
                  Return to My Orders
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrderPayment;
