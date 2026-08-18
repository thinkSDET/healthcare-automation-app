import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const listLabTestOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLabTestOrderById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createLabTestOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateLabTestOrderStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadLabTestResult: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const acknowledgeLabTestOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const downloadLabTestResult: (req: AuthRequest, res: Response) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=lab-order.controller.d.ts.map