import { Request, Response } from "express";
export declare const getDoctors: (_req: Request, res: Response) => Promise<void>;
export declare const getDoctorById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createDoctor: (req: Request, res: Response) => Promise<void>;
export declare const updateDoctor: (req: Request, res: Response) => Promise<void>;
export declare const deleteDoctor: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=doctor.controller.d.ts.map