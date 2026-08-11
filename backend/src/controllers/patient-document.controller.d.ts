import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getPatientDocuments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadPatientDocument: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const downloadPatientDocument: (req: AuthRequest, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const deletePatientDocument: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=patient-document.controller.d.ts.map