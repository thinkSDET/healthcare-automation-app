import { Request, Response } from "express";
export declare const getPatientPrescriptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPrescriptionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPrescription: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePrescriptionStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePrescription: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=prescription.controller.d.ts.map