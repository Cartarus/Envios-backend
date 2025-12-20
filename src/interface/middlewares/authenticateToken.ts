import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../shared/errors/AppError";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token de autenticación no proporcionado");
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        throw new UnauthorizedError("Token de autenticación inválido o expirado");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
}