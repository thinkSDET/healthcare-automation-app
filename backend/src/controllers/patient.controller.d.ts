import { Request, Response } from "express";
export declare const getPatients: (_req: Request, res: Response) => Promise<void>;
export declare const getPatientById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPatient: (req: Request, res: Response) => Promise<void>;
export declare const updatePatient: (req: Request, res: Response) => Promise<void>;
export declare const deletePatient: (req: Request, res: Response) => Promise<void>;
export declare const deactivatePatient: (req: any, res: any) => Promise<any>;
export declare const getPatientDependents: (req: any, res: any) => Promise<any>;
export declare const createPatientDependent: (req: any, res: any) => Promise<any>;
export declare const deletePatientDependent: (req: any, res: any) => Promise<any>;
export declare const getPatientEmergencyContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const savePatientEmergencyContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePatientEmergencyContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPatientMedicalProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const savePatientMedicalProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPatientAppointments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=patient.controller.d.ts.map