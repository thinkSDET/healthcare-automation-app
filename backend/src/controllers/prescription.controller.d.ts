import { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getPatientPrescriptions: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPrescriptionById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPrescription: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePrescriptionStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePrescription: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=prescription.controller.d.ts.map