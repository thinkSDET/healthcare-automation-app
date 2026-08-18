import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const listReplenishmentRequests: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getReplenishmentRequestById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createReplenishmentRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateReplenishmentRequestStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=replenishment-request.controller.d.ts.map