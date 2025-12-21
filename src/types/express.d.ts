import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}