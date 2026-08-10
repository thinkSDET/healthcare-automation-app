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
            PROTECTED ROUTES
           ========================= */}

        {/* Everyone who is authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/change-password"
            element={<ChangePassword />}
          />
        </Route>

        {/* ADMIN + DOCTOR */}
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
          <Route
            path="/patients"
            element={<Patients />}
          />

          <Route
            path="/doctors"
            element={<Doctors />}
          />
        </Route>

        {/* ADMIN + DOCTOR + PATIENT */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCTOR",
                "PATIENT",
              ]}
            />
          }
        >
          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/appointments/new"
            element={<NewAppointment />}
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
            path="/patients/:id/orders"
            element={<PatientOrders />}
          />
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