import {
  Request,
  Response,
} from "express";

import * as prescriptionService
  from "../services/prescription.service";

/*
|--------------------------------------------------------------------------
| Get Patient Prescriptions
|--------------------------------------------------------------------------
*/

export const getPatientPrescriptions =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const patientId =
        Number(req.params.patientId);

      if (
        Number.isNaN(patientId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const prescriptions =
        await prescriptionService
          .getPatientPrescriptions(
            patientId
          );

      return res.status(200).json({
        success: true,
        data: prescriptions,
      });

    } catch (error) {

      console.error(
        "GET PATIENT PRESCRIPTIONS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch prescriptions",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/

export const getPrescriptionById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const prescriptionId =
        Number(req.params.id);

      if (
        Number.isNaN(
          prescriptionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid prescription ID",
        });
      }

      const prescription =
        await prescriptionService
          .getPrescriptionById(
            prescriptionId
          );

      return res.status(200).json({
        success: true,
        data: prescription,
      });

    } catch (error) {

      console.error(
        "GET PRESCRIPTION ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PRESCRIPTION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Prescription not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch prescription",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/

export const createPrescription =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        patientId,
        doctorId,
        prescribedAt,
        diagnosis,
        notes,
        status,
        items,
      } = req.body;

      if (
        !patientId ||
        !doctorId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient and doctor are required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one medicine is required",
        });
      }

      const prescription =
        await prescriptionService
          .createPrescription({
            patientId:
              Number(patientId),

            doctorId:
              Number(doctorId),

            prescribedAt,

            diagnosis,

            notes,

            status,

            items,
          });

      return res.status(201).json({
        success: true,
        message:
          "Prescription created successfully",
        data: prescription,
      });

    } catch (error) {

      console.error(
        "CREATE PRESCRIPTION ERROR:",
        error
      );

      if (
        error instanceof Error
      ) {

        switch (
          error.message
        ) {

          case "PATIENT_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Patient not found",
            });

          case "DOCTOR_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Doctor not found",
            });

          case "PRESCRIPTION_ITEMS_REQUIRED":
            return res.status(400).json({
              success: false,
              message:
                "At least one medicine is required",
            });

          case "INVALID_PRESCRIPTION_ITEM":
            return res.status(400).json({
              success: false,
              message:
                "Medicine name, dosage, frequency and duration are required for every medicine",
            });

        }
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create prescription",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/

export const updatePrescriptionStatus =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const prescriptionId =
        Number(req.params.id);

      const {
        status,
      } = req.body;

      if (
        Number.isNaN(
          prescriptionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid prescription ID",
        });
      }

      if (
        ![
          "ACTIVE",
          "COMPLETED",
          "CANCELLED",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid prescription status",
        });
      }

      const prescription =
        await prescriptionService
          .updatePrescriptionStatus(
            prescriptionId,
            status
          );

      return res.status(200).json({
        success: true,
        message:
          "Prescription status updated successfully",
        data: prescription,
      });

    } catch (error) {

      console.error(
        "UPDATE PRESCRIPTION STATUS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PRESCRIPTION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Prescription not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update prescription status",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/

export const deletePrescription =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const prescriptionId =
        Number(req.params.id);

      if (
        Number.isNaN(
          prescriptionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid prescription ID",
        });
      }

      const result =
        await prescriptionService
          .deletePrescription(
            prescriptionId
          );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {

      console.error(
        "DELETE PRESCRIPTION ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PRESCRIPTION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Prescription not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete prescription",
      });
    }
  };