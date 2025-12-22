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

  // Error de parsing de JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: "JSON inválido. Revisa que no haya comas finales o sintaxis incorrecta",
      error: err.message
    });
  }

  // Error no manejado
  console.error("Error no manejado:", err);
  
  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
};
