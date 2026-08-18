import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getAppointments: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getAppointmentById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAppointmentStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=appointment.controller.d.ts.map