import { Request, Response } from "express";
export declare const getAppointments: (_req: Request, res: Response) => Promise<void>;
export declare const getAppointmentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAppointment: (req: Request, res: Response) => Promise<void>;
export declare const updateAppointment: (req: Request, res: Response) => Promise<void>;
export declare const cancelAppointment: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=appointment.controller.d.ts.map