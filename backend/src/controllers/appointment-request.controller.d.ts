import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const createAppointmentRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listAppointmentRequests: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAppointmentRequestById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAppointmentRequestStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=appointment-request.controller.d.ts.map