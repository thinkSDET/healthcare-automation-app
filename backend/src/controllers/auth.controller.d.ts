import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const forgotPasswordController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetPasswordController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changePasswordController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map