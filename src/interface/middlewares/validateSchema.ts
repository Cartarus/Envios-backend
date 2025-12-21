import { Request, Response, NextFunction } from "express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Joi = require("joi");

export const validateSchema =
  (schema: typeof Joi.ObjectSchema, property: "body" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.details.map((e: any) => e.message)
      });
    }

    req.body = value;
    next();
  };
