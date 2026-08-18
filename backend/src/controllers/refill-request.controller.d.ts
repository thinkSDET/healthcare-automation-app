import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const createRefillRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listRefillRequests: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRefillRequestById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateRefillRequestStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createOrderFromRefillRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=refill-request.controller.d.ts.map