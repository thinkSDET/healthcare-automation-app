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
exports.getPatientAppointments = exports.savePatientMedicalProfile = exports.getPatientMedicalProfile = exports.deletePatientEmergencyContact = exports.savePatientEmergencyContact = exports.getPatientEmergencyContact = exports.deletePatientDependent = exports.createPatientDependent = exports.getPatientDependents = exports.deactivatePatient = exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getPatients = void 0;
const express_1 = require("express");
const patientService = __importStar(require("../services/patient.service"));
const patientDependentService = __importStar(require("../services/patient-dependent.service"));
/*
|--------------------------------------------------------------------------
| Patients
|--------------------------------------------------------------------------
*/
const getPatients = async (_req, res) => {
    try {
        const patients = await patientService.getPatients();
        res.status(200).json({
            success: true,
            data: patients,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch patients",
        });
    }
};
exports.getPatients = getPatients;
const getPatientById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const patient = await patientService.getPatientById(id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        res.status(200).json({
            success: true,
            data: patient,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient",
        });
    }
};
exports.getPatientById = getPatientById;
const createPatient = async (req, res) => {
    try {
        const patient = await patientService.createPatient({
            ...req.body,
            dateOfBirth: new Date(req.body.dateOfBirth),
        });
        res.status(201).json({
            success: true,
            data: patient,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to create patient",
        });
    }
};
exports.createPatient = createPatient;
const updatePatient = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const patient = await patientService.updatePatient(id, req.body);
        res.status(200).json({
            success: true,
            data: patient,
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update patient",
        });
    }
};
exports.updatePatient = updatePatient;
const deletePatient = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await patientService.deletePatient(id);
        res.status(204).send();
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete patient",
        });
    }
};
exports.deletePatient = deletePatient;
const deactivatePatient = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const patient = await patientService.deactivatePatient(patientId);
        return res.status(200).json({
            success: true,
            message: "Patient deactivated successfully",
            data: patient,
        });
    }
    catch (error) {
        console.error("DEACTIVATE PATIENT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        if (error instanceof Error &&
            error.message ===
                "PATIENT_ALREADY_INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Patient is already inactive",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to deactivate patient",
        });
    }
};
exports.deactivatePatient = deactivatePatient;
/*
|--------------------------------------------------------------------------
| Dependents
|--------------------------------------------------------------------------
*/
const getPatientDependents = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const dependents = await patientDependentService.getDependents(patientId);
        return res.status(200).json({
            success: true,
            data: dependents,
        });
    }
    catch (error) {
        console.error("GET DEPENDENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dependents",
        });
    }
};
exports.getPatientDependents = getPatientDependents;
const createPatientDependent = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const { firstName, lastName, relationship, dateOfBirth, gender, phone, email, } = req.body;
        if (!firstName ||
            !lastName ||
            !relationship) {
            return res.status(400).json({
                success: false,
                message: "First name, last name and relationship are required",
            });
        }
        const dependent = await patientDependentService.createDependent(patientId, {
            firstName,
            lastName,
            relationship,
            dateOfBirth,
            gender,
            phone,
            email,
        });
        return res.status(201).json({
            success: true,
            message: "Dependent added successfully",
            data: dependent,
        });
    }
    catch (error) {
        console.error("CREATE DEPENDENT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to add dependent",
        });
    }
};
exports.createPatientDependent = createPatientDependent;
const deletePatientDependent = async (req, res) => {
    try {
        const dependentId = Number(req.params.dependentId);
        if (Number.isNaN(dependentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dependent ID",
            });
        }
        const result = await patientDependentService.deleteDependent(dependentId);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("DELETE DEPENDENT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "DEPENDENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Dependent not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to remove dependent",
        });
    }
};
exports.deletePatientDependent = deletePatientDependent;
/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/
const getPatientEmergencyContact = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const contact = await patientService.getPatientEmergencyContact(patientId);
        return res.status(200).json({
            success: true,
            data: contact,
        });
    }
    catch (error) {
        console.error("GET EMERGENCY CONTACT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch emergency contact",
        });
    }
};
exports.getPatientEmergencyContact = getPatientEmergencyContact;
const savePatientEmergencyContact = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const { firstName: requestFirstName, lastName: requestLastName, name, relationship, phone, alternatePhone, email, address, } = req.body;
        // The UI uses a single Full Name field, while the service expects
        // firstName and lastName. Accept both payload formats here.
        let firstName = requestFirstName?.trim();
        let lastName = requestLastName?.trim();
        if ((!firstName || !lastName) && name?.trim()) {
            const nameParts = name.trim().split(/\s+/).filter(Boolean);
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ");
        }
        if (!firstName ||
            !lastName ||
            !relationship ||
            !phone) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, relationship and phone are required",
            });
        }
        const contact = await patientService.upsertPatientEmergencyContact(patientId, {
            firstName,
            lastName,
            relationship,
            phone,
            alternatePhone,
            email,
            address,
        });
        return res.status(200).json({
            success: true,
            message: "Emergency contact saved successfully",
            data: contact,
        });
    }
    catch (error) {
        console.error("SAVE EMERGENCY CONTACT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to save emergency contact",
        });
    }
};
exports.savePatientEmergencyContact = savePatientEmergencyContact;
const deletePatientEmergencyContact = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const result = await patientService.deletePatientEmergencyContact(patientId);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("DELETE EMERGENCY CONTACT ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "EMERGENCY_CONTACT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Emergency contact not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete emergency contact",
        });
    }
};
exports.deletePatientEmergencyContact = deletePatientEmergencyContact;
/*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/
const getPatientMedicalProfile = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const profile = await patientService.getPatientMedicalProfile(patientId);
        return res.status(200).json({
            success: true,
            data: profile,
        });
    }
    catch (error) {
        console.error("GET MEDICAL PROFILE ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch medical profile",
        });
    }
};
exports.getPatientMedicalProfile = getPatientMedicalProfile;
const savePatientMedicalProfile = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const { medicalConditions, allergies, currentMedications, medicalNotes, } = req.body;
        const profile = await patientService
            .upsertPatientMedicalProfile(patientId, {
            medicalConditions,
            allergies,
            currentMedications,
            medicalNotes,
        });
        return res.status(200).json({
            success: true,
            message: "Medical profile saved successfully",
            data: profile,
        });
    }
    catch (error) {
        console.error("SAVE MEDICAL PROFILE ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to save medical profile",
        });
    }
};
exports.savePatientMedicalProfile = savePatientMedicalProfile;
/*
|--------------------------------------------------------------------------
| Patient Appointment History
|--------------------------------------------------------------------------
*/
const getPatientAppointments = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const appointments = await patientService.getPatientAppointments(patientId);
        return res.status(200).json({
            success: true,
            data: appointments,
        });
    }
    catch (error) {
        console.error("GET PATIENT APPOINTMENTS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment history",
        });
    }
};
exports.getPatientAppointments = getPatientAppointments;
//# sourceMappingURL=patient.controller.js.map