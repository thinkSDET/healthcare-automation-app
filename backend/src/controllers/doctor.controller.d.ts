import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getDoctors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDoctorById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createDoctor: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateDoctor: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteDoctor: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=doctor.controller.d.ts.map