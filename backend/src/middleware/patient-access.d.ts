import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare const requirePatientAccess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=patient-access.d.ts.map