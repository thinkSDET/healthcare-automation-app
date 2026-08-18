import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const listMedications: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMedicationById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createMedication: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMedication: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const adjustMedicationStock: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listMedicationMovements: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=medication.controller.d.ts.map