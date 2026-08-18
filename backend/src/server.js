"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./config/prisma");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const cors_1 = __importDefault(require("cors"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const refill_request_routes_1 = __importDefault(require("./routes/refill-request.routes"));
const appointment_request_routes_1 = __importDefault(require("./routes/appointment-request.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const medication_routes_1 = __importDefault(require("./routes/medication.routes"));
const replenishment_request_routes_1 = __importDefault(require("./routes/replenishment-request.routes"));
const lab_order_routes_1 = __importDefault(require("./routes/lab-order.routes"));
const app = (0, express_1.default)();
const PORT = 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/patients", patient_routes_1.default);
app.use("/api/doctors", doctor_routes_1.default);
app.use("/api/appointments", appointment_routes_1.default);
app.use("/api/prescriptions", prescription_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/refill-requests", refill_request_routes_1.default);
app.use("/api/appointment-requests", appointment_request_routes_1.default);
app.use("/api/audit-events", audit_routes_1.default);
app.use("/api/medications", medication_routes_1.default);
app.use("/api/replenishment-requests", replenishment_request_routes_1.default);
app.use("/api/lab-orders", lab_order_routes_1.default);
// Health check
app.get("/api/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "UP",
            database: "CONNECTED",
            message: "Healthcare API is running"
        });
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map