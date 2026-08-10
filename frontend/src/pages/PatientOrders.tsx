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

interface DraftOrderItem {
  productName: string;
  quantity: number;
  unitPrice: string;
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

  const [showCreateOrder, setShowCreateOrder] =
    useState(false);

  const [creatingOrder, setCreatingOrder] =
    useState(false);

  const [orderItems, setOrderItems] =
    useState<DraftOrderItem[]>([
      {
        productName: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [orderNotes, setOrderNotes] =
    useState("");

  const [orderPaymentStatus, setOrderPaymentStatus] =
    useState("PENDING");

  const [orderSearch, setOrderSearch] =
    useState("");

  const [orderStatusFilter, setOrderStatusFilter] =
    useState("ALL");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("ALL");


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

  const resetCreateOrderForm = () => {
    setOrderItems([
      {
        productName: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);

    setDeliveryAddress("");
    setOrderNotes("");
    setOrderPaymentStatus("PENDING");
  };

  const addOrderItem = () => {
    setOrderItems((previous) => [
      ...previous,
      {
        productName: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const updateOrderItem = (
    index: number,
    field:
      | "productName"
      | "quantity"
      | "unitPrice",
    value: string
  ) => {
    setOrderItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? Math.max(
                      1,
                      Number(value) || 1
                    )
                  : value,
            }
          : item
      )
    );
  };

  const calculateDraftTotal = () =>
    orderItems.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0) *
          (Number(item.unitPrice) || 0),
      0
    );

  const handleCreateOrder = async () => {
    try {
      setError("");
      setSuccess("");

      if (!id) {
        throw new Error("Patient ID is missing");
      }

      const validItems = orderItems.every(
        (item) =>
          item.productName.trim() &&
          Number(item.quantity) > 0 &&
          Number(item.unitPrice) >= 0
      );

      if (!validItems) {
        setError(
          "Please provide product name, quantity and price for every item."
        );
        return;
      }

      setCreatingOrder(true);

      const response = await fetch(
        "http://localhost:4000/api/orders",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: Number(id),
            paymentStatus:
              orderPaymentStatus,
            deliveryAddress:
              deliveryAddress.trim() ||
              undefined,
            notes:
              orderNotes.trim() ||
              undefined,
            items: orderItems.map(
              (item) => ({
                productName:
                  item.productName.trim(),
                quantity:
                  Number(item.quantity),
                unitPrice:
                  Number(item.unitPrice),
              })
            ),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to create order"
        );
      }

      setOrders((previous) => [
        result.data,
        ...previous,
      ]);

      setSelectedOrder(result.data);
      setShowCreateOrder(false);
      resetCreateOrderForm();

      setSuccess(
        "Order created successfully."
      );
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create order"
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  const filteredOrders =
    orders.filter((order) => {
      const search =
        orderSearch
          .trim()
          .toLowerCase();

      const matchesSearch =
        !search ||
        order.orderNo
          .toLowerCase()
          .includes(search) ||
        order.status
          .toLowerCase()
          .includes(search) ||
        order.paymentStatus
          .toLowerCase()
          .includes(search) ||
        order.items.some((item) =>
          item.productName
            .toLowerCase()
            .includes(search)
        );

      const matchesOrderStatus =
        orderStatusFilter === "ALL" ||
        order.status ===
          orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        order.paymentStatus ===
          paymentStatusFilter;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });

  const orderSummary = {
    total: filteredOrders.length,

    pending: filteredOrders.filter(
      (order) =>
        order.status === "PENDING"
    ).length,

    delivered: filteredOrders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length,

    cancelled: filteredOrders.filter(
      (order) =>
        order.status === "CANCELLED"
    ).length,

    totalValue:
      filteredOrders.reduce(
        (total, order) =>
          total +
          Number(order.totalAmount),
        0
      ),
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


          <section className="orders-summary-section">

            <div className="orders-summary-grid">

              <div className="order-summary-card">
                <span className="order-summary-icon">
                  📦
                </span>

                <div>
                  <span>
                    Total Orders
                  </span>

                  <strong>
                    {orderSummary.total}
                  </strong>
                </div>
              </div>

              <div className="order-summary-card">
                <span className="order-summary-icon">
                  ⏳
                </span>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {orderSummary.pending}
                  </strong>
                </div>
              </div>

              <div className="order-summary-card">
                <span className="order-summary-icon">
                  ✓
                </span>

                <div>
                  <span>
                    Delivered
                  </span>

                  <strong>
                    {orderSummary.delivered}
                  </strong>
                </div>
              </div>

              <div className="order-summary-card">
                <span className="order-summary-icon">
                  ✕
                </span>

                <div>
                  <span>
                    Cancelled
                  </span>

                  <strong>
                    {orderSummary.cancelled}
                  </strong>
                </div>
              </div>

              <div className="order-summary-card order-summary-total">
                <span className="order-summary-icon">
                  ₹
                </span>

                <div>
                  <span>
                    Total Value
                  </span>

                  <strong>
                    {formatCurrency(
                      orderSummary.totalValue
                    )}
                  </strong>
                </div>
              </div>

            </div>

          </section>


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

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowCreateOrder(
                    (previous) => !previous
                  );
                }}
              >
                {showCreateOrder
                  ? "Close"
                  : "+ Create Order"}
              </button>

            </div>


            {showCreateOrder && (
              <div className="create-order-panel">

                <div className="create-order-panel-header">
                  <div>
                    <h4>
                      Create New Order
                    </h4>

                    <p>
                      Add one or more products
                      to create an order for this patient.
                    </p>
                  </div>
                </div>

                <div className="order-items-form">

                  {orderItems.map(
                    (item, index) => (
                      <div
                        className="order-item-form-row"
                        key={index}
                      >

                        <div>
                          <label>
                            Product Name
                          </label>

                          <input
                            type="text"
                            value={item.productName}
                            placeholder="e.g. Prescription refill"
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "productName",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>
                            Unit Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            placeholder="0.00"
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "unitPrice",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              removeOrderItem(index)
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>
                    )
                  )}

                </div>

                <div className="create-order-form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addOrderItem}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="create-order-extra-grid">

                  <div>
                    <label>
                      Payment Status
                    </label>

                    <select
                      value={orderPaymentStatus}
                      onChange={(e) =>
                        setOrderPaymentStatus(
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

                  <div>
                    <label>
                      Delivery Address
                    </label>

                    <textarea
                      value={deliveryAddress}
                      placeholder="Optional delivery address"
                      onChange={(e) =>
                        setDeliveryAddress(
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <label>
                      Notes
                    </label>

                    <textarea
                      value={orderNotes}
                      placeholder="Optional order notes"
                      onChange={(e) =>
                        setOrderNotes(
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>

                </div>

                <div className="create-order-total">
                  <span>
                    Order Total
                  </span>

                  <strong>
                    {formatCurrency(
                      calculateDraftTotal()
                    )}
                  </strong>
                </div>

                <div className="create-order-form-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={creatingOrder}
                    onClick={() => {
                      resetCreateOrderForm();
                      setShowCreateOrder(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={creatingOrder}
                    onClick={handleCreateOrder}
                  >
                    {creatingOrder
                      ? "Creating..."
                      : "Create Order"}
                  </button>

                </div>

              </div>
            )}

            {orders.length > 0 && (
              <div className="orders-filter-panel">

                <div className="orders-filter-search">
                  <label>
                    Search Orders
                  </label>

                  <input
                    type="text"
                    value={orderSearch}
                    placeholder="Search by order number or product..."
                    onChange={(e) =>
                      setOrderSearch(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    Order Status
                  </label>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) =>
                      setOrderStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="ALL">
                      All Statuses
                    </option>
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
                    value={paymentStatusFilter}
                    onChange={(e) =>
                      setPaymentStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="ALL">
                      All Payments
                    </option>
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

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setOrderSearch("");
                    setOrderStatusFilter("ALL");
                    setPaymentStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>

              </div>
            )}

            {orders.length > 0 &&
              filteredOrders.length === 0 && (
                <div className="empty-state">
                  No orders match the selected filters.
                </div>
              )}

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

                {filteredOrders.map(
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


              <div className="order-patient-info-card">

                <div>
                  <span>
                    Patient
                  </span>

                  <strong>
                    {patient.firstName}{" "}
                    {patient.lastName}
                  </strong>
                </div>

                <div>
                  <span>
                    Medical ID
                  </span>

                  <strong>
                    {patient.medicalId}
                  </strong>
                </div>

                <div>
                  <span>
                    Order Number
                  </span>

                  <strong>
                    {selectedOrder.orderNo}
                  </strong>
                </div>

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


              <div className="order-price-breakdown">

                <div>
                  <span>
                    Items
                  </span>

                  <strong>
                    {
                      selectedOrder.items.length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedOrder.items.reduce(
                        (total, item) =>
                          total +
                          Number(
                            item.totalPrice
                          ),
                        0
                      )
                    )}
                  </strong>
                </div>

                <div className="order-grand-total">
                  <span>
                    Order Total
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedOrder.totalAmount
                    )}
                  </strong>
                </div>

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


              <div className="order-status-timeline">

                <div className="order-status-timeline-header">
                  <div>
                    <h4>
                      Order Progress
                    </h4>

                    <p>
                      Current order status
                    </p>
                  </div>

                  <span
                    className={getOrderStatusClass(
                      selectedOrder.status
                    )}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="order-status-steps">

                  {[
                    "PENDING",
                    "CONFIRMED",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                  ].map(
                    (status, index) => {

                      const statusOrder = [
                        "PENDING",
                        "CONFIRMED",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ];

                      const currentIndex =
                        statusOrder.indexOf(
                          selectedOrder.status
                        );

                      const stepIndex =
                        statusOrder.indexOf(
                          status
                        );

                      const completed =
                        selectedOrder.status !==
                          "CANCELLED" &&
                        currentIndex >=
                          stepIndex;

                      return (
                        <div
                          className={
                            completed
                              ? "order-status-step completed"
                              : "order-status-step"
                          }
                          key={status}
                        >

                          <div className="order-status-dot">
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <span>
                            {status}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

                {selectedOrder.status ===
                  "CANCELLED" && (
                  <div className="order-cancelled-note">
                    This order has been cancelled.
                  </div>
                )}

              </div>


              <div className="order-delivery-card">

                <div className="order-delivery-header">
                  <h4>
                    Delivery Information
                  </h4>
                </div>

                <div className="order-delivery-content">

                  <div>
                    <span>
                      Delivery Address
                    </span>

                    <p>
                      {selectedOrder.deliveryAddress ||
                        "No delivery address provided."}
                    </p>
                  </div>

                  <div>
                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {
                        selectedOrder.paymentStatus
                      }
                    </strong>
                  </div>

                </div>

              </div>


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