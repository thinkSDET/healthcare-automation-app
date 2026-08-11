import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getPatientOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePaymentStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=order.controller.d.ts.map