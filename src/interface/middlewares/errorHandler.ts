import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error no manejado
  console.error("Error no manejado:", err);
  
  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
};
