import Joi from "joi";

export const getRateSchema = Joi.object({
  origin: Joi.string()
    .min(2)
    .max(10)
    .required()
    .messages({
      "string.min": "El origen debe tener al menos 2 caracteres",
      "string.max": "El origen no puede superar los 10 caracteres",
      "any.required": "El origen es obligatorio",
      "string.empty": "El origen no puede estar vacío"
    }),

  destination: Joi.string()
    .min(2)
    .max(10)
    .required()
    .messages({
      "string.min": "El destino debe tener al menos 2 caracteres",
      "string.max": "El destino no puede superar los 10 caracteres",
      "any.required": "El destino es obligatorio",
      "string.empty": "El destino no puede estar vacío"
    }),

  weight: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "El peso debe ser un número",
      "number.positive": "El peso debe ser un valor positivo",
      "any.required": "El peso es obligatorio"
    }),

  height: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "La altura debe ser un número",
      "number.positive": "La altura debe ser un valor positivo",
      "any.required": "La altura es obligatoria"
    }),

  width: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "El ancho debe ser un número",
      "number.positive": "El ancho debe ser un valor positivo",
      "any.required": "El ancho es obligatorio"
    }),

  length: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "El largo debe ser un número",
      "number.positive": "El largo debe ser un valor positivo",
      "any.required": "El largo es obligatorio"
    })
})
  .required()
  .unknown(false);
