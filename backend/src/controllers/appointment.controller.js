"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.updateAppointmentStatus = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const appointmentService = __importStar(require("../services/appointment.service"));
const mapAppointmentError = (error) => {
    const message = error instanceof Error
        ? error.message
        : "Appointment operation failed";
    switch (message) {
        case "Appointment not found":
        case "Patient not found":
        case "Doctor not found":
            return { status: 404, message };
        case "You do not have permission to perform this appointment status change":
            return { status: 403, message };
        case "Doctor already has an overlapping appointment":
        case "Patient already has an overlapping appointment":
            return { status: 409, message };
        case "Invalid appointment status transition":
        case "Cannot modify a terminal appointment":
        case "Appointment schedule can only be edited when SCHEDULED or CONFIRMED":
        case "Only scheduled appointments can be cancelled":
        case "Appointment cannot be scheduled in the past":
        case "Appointment duration must be greater than 0":
        case "Doctor is not active and cannot receive appointments":
            return { status: 400, message };
        default:
            return { status: 500, message };
    }
};
const getAppointments = async (_req, res) => {
    try {
        const appointments = await appointmentService.getAppointments();
        res.status(200).json({
            success: true,
            data: appointments,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
        });
    }
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        const appointment = await appointmentService.getAppointmentById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment",
        });
    }
};
exports.getAppointmentById = getAppointmentById;
const createAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const appointment = await appointmentService.createAppointment({
            ...req.body,
            appointmentAt: new Date(req.body.appointmentAt),
        }, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        res.status(201).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        const mapped = mapAppointmentError(error);
        res.status(mapped.status).json({
            success: false,
            message: mapped.status === 500
                ? "Failed to create appointment"
                : mapped.message,
        });
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const data = {
            ...req.body,
            ...(req.body.appointmentAt && {
                appointmentAt: new Date(req.body.appointmentAt),
            }),
        };
        const appointment = await appointmentService.updateAppointment(id, data, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        const mapped = mapAppointmentError(error);
        res.status(mapped.status).json({
            success: false,
            message: mapped.status === 500
                ? "Failed to update appointment"
                : mapped.message,
        });
    }
};
exports.updateAppointment = updateAppointment;
const updateAppointmentStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const appointment = await appointmentService.updateAppointmentStatus(id, req.body.status, req.user.role, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        const mapped = mapAppointmentError(error);
        res.status(mapped.status).json({
            success: false,
            message: mapped.status === 500
                ? "Failed to update appointment status"
                : mapped.message,
        });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const cancelAppointment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID",
            });
        }
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const appointment = await appointmentService.cancelAppointment(id, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        const mapped = mapAppointmentError(error);
        res.status(mapped.status).json({
            success: false,
            message: mapped.status === 500
                ? "Failed to cancel appointment"
                : mapped.message,
        });
    }
};
exports.cancelAppointment = cancelAppointment;
//# sourceMappingURL=appointment.controller.js.map