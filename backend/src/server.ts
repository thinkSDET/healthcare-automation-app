import express from "express";
import { prisma } from "./config/prisma";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import doctorRoutes from "./routes/doctor.routes";
import appointmentRoutes from "./routes/appointment.routes";
import cors from "cors";
import prescriptionRoutes from "./routes/prescription.routes";
import orderRoutes
  from "./routes/order.routes";


const app = express();

const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use(
  "/api/prescriptions",
  prescriptionRoutes
);
app.use(
  "/api/orders",
  orderRoutes
);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "UP",
      database: "CONNECTED",
      message: "Healthcare API is running"
    });
  } catch (error) {
    res.status(500).json({
      status: "DOWN",
      database: "DISCONNECTED",
      message: "Database connection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Healthcare API running on http://localhost:${PORT}`);
});