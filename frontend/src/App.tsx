/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import NewAppointment from "./pages/NewAppointment";
import AppointmentDetails from "./pages/AppointmentDetails";

import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./pages/ProtectedRoute";
import PatientDetails from "./pages/PatientDetails";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import PatientOrders from "./pages/PatientOrders";
import MyPatientProfile from "./pages/MyPatientProfile";
import MyAppointments from "./pages/MyAppointments";
import MyOrders from "./pages/MyOrders";
import ShipmentTracking from "./pages/ShipmentTracking";
import OrderPayment from "./pages/OrderPayment";
import PaymentFormEmbed from "./pages/PaymentFormEmbed";
import PharmacyWorkspace from "./pages/PharmacyWorkspace";
import MyPrescriptions from "./pages/MyPrescriptions";
import RefillRequestReview from "./pages/RefillRequestReview";
import RequestAppointment from "./pages/RequestAppointment";
import AppointmentRequestReview from "./pages/AppointmentRequestReview";
import AuditLogs from "./pages/AuditLogs";
import Inventory from "./pages/Inventory";
import ReplenishmentRequests from "./pages/ReplenishmentRequests";
import LabOrders from "./pages/LabOrders";
import LabOrderDetails from "./pages/LabOrderDetails";
import MyLabOrders from "./pages/MyLabOrders";
import MyLabOrderDetails from "./pages/MyLabOrderDetails";
import AppLayout from "./components/AppLayout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
           ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =========================
            AUTHENTICATED ROUTES
           ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/change-password"
              element={<ChangePassword />}
            />
          </Route>
        </Route>


        {/* =========================
            ADMIN + DOCTOR
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCTOR",
              ]}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/patients"
              element={<Patients />}
            />

            <Route
              path="/doctors"
              element={<Doctors />}
            />

            <Route
              path="/appointments"
              element={<Appointments />}
            />

            <Route
              path="/appointments/:id"
              element={<AppointmentDetails />}
            />

            <Route
              path="/patients/:id"
              element={<PatientDetails />}
            />

            <Route
              path="/patients/:id/prescriptions"
              element={<PatientPrescriptions />}
            />

            <Route
              path="/refill-requests"
              element={<RefillRequestReview />}
            />

            <Route
              path="/appointment-requests"
              element={<AppointmentRequestReview />}
            />

            <Route
              path="/lab-orders"
              element={<LabOrders />}
            />

            <Route
              path="/lab-orders/:id"
              element={<LabOrderDetails />}
            />
          </Route>
        </Route>


        {/* =========================
            ADMIN ONLY
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
              ]}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/appointments/new"
              element={<NewAppointment />}
            />

            <Route
              path="/patients/:id/orders"
              element={<PatientOrders />}
            />
          </Route>
        </Route>


        {/* =========================
            ADMIN + PHARMACIST (Inventory)
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PHARMACIST",
              ]}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/inventory"
              element={<Inventory />}
            />

            <Route
              path="/replenishment-requests"
              element={<ReplenishmentRequests />}
            />
          </Route>
        </Route>


        {/* =========================
            PATIENT PORTAL
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "PATIENT",
              ]}
            />
          }
        >
          {/* Payment form embed — no app chrome (iframe target) */}
          <Route
            path="/payment-embed"
            element={<PaymentFormEmbed />}
          />

          <Route element={<AppLayout />}>
            <Route
              path="/my/profile"
              element={<MyPatientProfile />}
            />

            <Route
              path="/my/appointments"
              element={<MyAppointments />}
            />

            <Route
              path="/my/appointments/request"
              element={<RequestAppointment />}
            />

            <Route
              path="/my/orders"
              element={<MyOrders />}
            />

            <Route
              path="/my/orders/:orderId/tracking"
              element={<ShipmentTracking />}
            />

            <Route
              path="/my/orders/:orderId/pay"
              element={<OrderPayment />}
            />

            <Route
              path="/my/prescriptions"
              element={<MyPrescriptions />}
            />

            <Route
              path="/my/lab-orders"
              element={<MyLabOrders />}
            />

            <Route
              path="/my/lab-orders/:id"
              element={<MyLabOrderDetails />}
            />
          </Route>
        </Route>


        {/* =========================
            PHARMACIST WORKSPACE
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "PHARMACIST",
              ]}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/pharmacy"
              element={<PharmacyWorkspace />}
            />
            <Route
              path="/refill-requests"
              element={<RefillRequestReview />}
            />
          </Route>
        </Route>


        {/* =========================
            ADMIN + VIEWER + SUPPORT (Audit)
           ========================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "VIEWER",
                "SUPPORT",
              ]}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/audit-logs"
              element={<AuditLogs />}
            />
          </Route>
        </Route>


        {/* =========================
            FALLBACK ROUTE
           ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
