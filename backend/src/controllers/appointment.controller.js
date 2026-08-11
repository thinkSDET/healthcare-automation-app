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
exports.cancelAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const express_1 = require("express");
const appointmentService = __importStar(require("../services/appointment.service"));
const getAppointments = async (_req, res) => {
    try {
        const appointments = await appointmentService.getAppointments();
        res.status(200).json({
            success: true,
            data: appointments
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments"
        });
    }
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const appointment = await appointmentService.getAppointmentById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        res.status(200).json({
            success: true,
            data: appointment
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment"
        });
    }
};
exports.getAppointmentById = getAppointmentById;
const createAppointment = async (req, res) => {
    try {
        const appointment = await appointmentService.createAppointment({
            ...req.body,
            appointmentAt: new Date(req.body.appointmentAt)
        });
        res.status(201).json({
            success: true,
            data: appointment
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create appointment";
        res.status(409).json({
            success: false,
            message
        });
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = {
            ...req.body,
            ...(req.body.appointmentAt && {
                appointmentAt: new Date(req.body.appointmentAt)
            })
        };
        const appointment = await appointmentService.updateAppointment(id, data);
        res.status(200).json({
            success: true,
            data: appointment
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update appointment"
        });
    }
};
exports.updateAppointment = updateAppointment;
const cancelAppointment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const appointment = await appointmentService.cancelAppointment(id);
        res.status(200).json({
            success: true,
            data: appointment
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to cancel appointment"
        });
    }
};
exports.cancelAppointment = cancelAppointment;
//# sourceMappingURL=appointment.controller.js.map