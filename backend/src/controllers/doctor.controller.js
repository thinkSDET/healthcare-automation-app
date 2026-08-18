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
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getDoctors = void 0;
const doctorService = __importStar(require("../services/doctor.service"));
const getDoctors = async (req, res) => {
    try {
        const role = req.user?.role?.toUpperCase();
        const doctors = await doctorService.getDoctors({
            activeOnly: role === "PATIENT",
        });
        res.status(200).json({
            success: true,
            data: doctors
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors"
        });
    }
};
exports.getDoctors = getDoctors;
const getDoctorById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const role = req.user?.role?.toUpperCase();
        const doctor = await doctorService.getDoctorById(id);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        if (role === "PATIENT" && doctor.status !== "ACTIVE") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        res.status(200).json({
            success: true,
            data: doctor
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor"
        });
    }
};
exports.getDoctorById = getDoctorById;
const createDoctor = async (req, res) => {
    try {
        const doctor = await doctorService.createDoctor(req.body);
        res.status(201).json({
            success: true,
            data: doctor
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to create doctor"
        });
    }
};
exports.createDoctor = createDoctor;
const updateDoctor = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const doctor = await doctorService.updateDoctor(id, req.body);
        res.status(200).json({
            success: true,
            data: doctor
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update doctor"
        });
    }
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await doctorService.deleteDoctor(id);
        res.status(204).send();
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete doctor"
        });
    }
};
exports.deleteDoctor = deleteDoctor;
//# sourceMappingURL=doctor.controller.js.map