import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface Order {
  id: number;
  orderNo: string;
  patientId: number;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number | string;
  deliveryAddress?: string | null;
  notes?: string | null;
  items: OrderItem[];
}

interface Patient {
  id: number;
  medicalId: string;
  firstName: string;
  lastName: string;
}

function PatientOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const getToken = () => {
    return (
      token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization:
          `Bearer ${getToken()}`,
        "Content-Type":
          "application/json",
      };

      const [
        patientResponse,
        ordersResponse,
      ] = await Promise.all([
        fetch(
          `http://localhost:4000/api/patients/${id}`,
          {
            headers,
          }
        ),

        fetch(
          `http://localhost:4000/api/orders/patient/${id}`,
          {
            headers,
          }
        ),
      ]);

      const patientResult =
        await patientResponse.json();

      const ordersResult =
        await ordersResponse.json();

      if (
        !patientResponse.ok ||
        !patientResult.success
      ) {
        throw new Error(
          patientResult.message ||
            "Failed to load patient"
        );
      }

      if (
        !ordersResponse.ok ||
        !ordersResult.success
      ) {
        throw new Error(
          ordersResult.message ||
            "Failed to load orders"
        );
      }

      setPatient(
        patientResult.data
      );

      setOrders(
        ordersResult.data || []
      );

    } catch (error) {
      console.error(
        "Failed to load orders:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders"
      );

    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange =
    async (
      orderId: number,
      status: string
    ) => {
      try {
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `http://localhost:4000/api/orders/${orderId}/status`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to update order status"
          );
        }

        setOrders(
          (previous) =>
            previous.map(
              (order) =>
                order.id === orderId
                  ? {
                      ...order,
                      status,
                    }
                  : order
            )
        );

        if (
          selectedOrder?.id ===
          orderId
        ) {
          setSelectedOrder(
            (previous) =>
              previous
                ? {
                    ...previous,
                    status,
                  }
                : null
          );
        }

        setSuccess(
          "Order status updated successfully."
        );

      } catch (error) {
        console.error(
          "Update order status error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to update order status"
        );
      }
    };

  const handlePaymentStatusChange =
    async (
      orderId: number,
      paymentStatus: string
    ) => {
      try {
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `http://localhost:4000/api/orders/${orderId}/payment-status`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                paymentStatus,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to update payment status"
          );
        }

        setOrders(
          (previous) =>
            previous.map(
              (order) =>
                order.id === orderId
                  ? {
                      ...order,
                      paymentStatus,
                    }
                  : order
            )
        );

        if (
          selectedOrder?.id ===
          orderId
        ) {
          setSelectedOrder(
            (previous) =>
              previous
                ? {
                    ...previous,
                    paymentStatus,
                  }
                : null
          );
        }

        setSuccess(
          "Payment status updated successfully."
        );

      } catch (error) {
        console.error(
          "Update payment status error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to update payment status"
        );
      }
    };

  const handleDeleteOrder =
    async (
      orderId: number
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `http://localhost:4000/api/orders/${orderId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${getToken()}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to delete order"
          );
        }

        setOrders(
          (previous) =>
            previous.filter(
              (order) =>
                order.id !== orderId
            )
        );

        setSelectedOrder(null);

        setSuccess(
          "Order deleted successfully."
        );

      } catch (error) {
        console.error(
          "Delete order error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete order"
        );
      }
    };

  const formatDate = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatCurrency = (
    value: number | string
  ) => {
    return `₹${Number(
      value
    ).toFixed(2)}`;
  };

  const getOrderStatusClass =
    (status: string) => {
      switch (
        status.toUpperCase()
      ) {
        case "DELIVERED":
          return "status-badge status-completed";

        case "CONFIRMED":
        case "PROCESSING":
          return "status-badge status-confirmed";

        case "SHIPPED":
          return "status-badge status-scheduled";

        case "CANCELLED":
          return "status-badge status-cancelled";

        default:
          return "status-badge status-scheduled";
      }
    };

  const getPaymentStatusClass =
    (status: string) => {
      switch (
        status.toUpperCase()
      ) {
        case "PAID":
          return "status-badge status-completed";

        case "FAILED":
        case "REFUNDED":
          return "status-badge status-cancelled";

        default:
          return "status-badge status-scheduled";
      }
    };

  if (loading) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="loading">
              Loading orders...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patients-page">
        <main className="patients-content">
          <div className="patients-card">
            <div className="empty-state">
              {error ||
                "Patient not found"}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="patients-page">

      <header className="patients-header">

        <div>
          <h1>
            Order History
          </h1>

          <p>
            {patient.firstName}{" "}
            {patient.lastName}
            {" • "}
            Medical ID:{" "}
            <strong>
              {patient.medicalId}
            </strong>
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate(
              `/patients/${patient.id}`
            )
          }
        >
          ← Back to Patient
        </button>

      </header>


      <main className="patients-content">

        <div className="patients-card">

          {error && (
            <div
              className="auth-error"
              style={{
                margin: "20px 30px 0",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              style={{
                margin: "20px 30px 0",
              }}
            >
              {success}
            </div>
          )}


          <section className="patient-details-section">

            <div className="section-heading-row">

              <div>
                <h3>
                  Orders
                </h3>

                <p className="section-description">
                  View and manage orders
                  associated with this patient.
                </p>
              </div>

            </div>


            {orders.length === 0 ? (

              <div className="empty-state">

                <div
                  style={{
                    fontSize: "36px",
                    marginBottom: "10px",
                  }}
                >
                  📦
                </div>

                <strong>
                  No orders found
                </strong>

                <p>
                  This patient does not
                  have any orders yet.
                </p>

              </div>

            ) : (

              <div className="order-list">

                {orders.map(
                  (order) => (

                    <div
                      className="order-card"
                      key={order.id}
                    >

                      <div className="order-card-header">

                        <div>

                          <strong>
                            {order.orderNo}
                          </strong>

                          <span>
                            {formatDateTime(
                              order.orderDate
                            )}
                          </span>

                        </div>

                        <span
                          className={getOrderStatusClass(
                            order.status
                          )}
                        >
                          {order.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                      </div>


                      <div className="order-summary-grid">

                        <div>

                          <span>
                            Items
                          </span>

                          <strong>
                            {
                              order.items.length
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Total
                          </span>

                          <strong>
                            {formatCurrency(
                              order.totalAmount
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Payment
                          </span>

                          <strong>
                            <span
                              className={getPaymentStatusClass(
                                order.paymentStatus
                              )}
                            >
                              {
                                order.paymentStatus
                              }
                            </span>
                          </strong>

                        </div>

                      </div>


                      <div className="order-card-actions">

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                        >
                          View Details
                        </button>


                        {order.status ===
                          "PENDING" && (
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleStatusChange(
                                order.id,
                                "CANCELLED"
                              )
                            }
                          >
                            Cancel Order
                          </button>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {selectedOrder && (

            <section className="patient-details-section">

              <div className="section-heading-row">

                <div>
                  <h3>
                    Order Details
                  </h3>

                  <p className="section-description">
                    {
                      selectedOrder.orderNo
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>


              <div className="order-detail-header">

                <div>
                  <span>
                    Order Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedOrder.orderDate
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      selectedOrder.status
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Payment
                  </span>

                  <strong>
                    {
                      selectedOrder.paymentStatus
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedOrder.totalAmount
                    )}
                  </strong>
                </div>

              </div>


              <div className="order-items-table">

                <div className="order-table-header">

                  <span>
                    Product
                  </span>

                  <span>
                    Quantity
                  </span>

                  <span>
                    Unit Price
                  </span>

                  <span>
                    Total
                  </span>

                </div>


                {selectedOrder.items.map(
                  (item) => (

                    <div
                      className="order-table-row"
                      key={item.id}
                    >

                      <strong>
                        {
                          item.productName
                        }
                      </strong>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <span>
                        {formatCurrency(
                          item.unitPrice
                        )}
                      </span>

                      <strong>
                        {formatCurrency(
                          item.totalPrice
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>


              {selectedOrder.deliveryAddress && (
                <div className="order-notes">

                  <span>
                    Delivery Address
                  </span>

                  <p>
                    {
                      selectedOrder.deliveryAddress
                    }
                  </p>

                </div>
              )}


              {selectedOrder.notes && (
                <div className="order-notes">

                  <span>
                    Notes
                  </span>

                  <p>
                    {selectedOrder.notes}
                  </p>

                </div>
              )}


              <div className="order-management-actions">

                <div>

                  <label>
                    Order Status
                  </label>

                  <select
                    value={
                      selectedOrder.status
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        selectedOrder.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="CONFIRMED">
                      Confirmed
                    </option>

                    <option value="PROCESSING">
                      Processing
                    </option>

                    <option value="SHIPPED">
                      Shipped
                    </option>

                    <option value="DELIVERED">
                      Delivered
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>

                  </select>

                </div>


                <div>

                  <label>
                    Payment Status
                  </label>

                  <select
                    value={
                      selectedOrder.paymentStatus
                    }
                    onChange={(e) =>
                      handlePaymentStatusChange(
                        selectedOrder.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="PAID">
                      Paid
                    </option>

                    <option value="FAILED">
                      Failed
                    </option>

                    <option value="REFUNDED">
                      Refunded
                    </option>

                  </select>

                </div>

              </div>


              <div className="patient-details-actions">

                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    handleDeleteOrder(
                      selectedOrder.id
                    )
                  }
                >
                  Delete Order
                </button>

              </div>

            </section>

          )}

        </div>

      </main>

    </div>
  );
}

export default PatientOrders;