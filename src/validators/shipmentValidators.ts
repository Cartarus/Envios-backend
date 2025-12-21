import Joi from "joi";

export const createShipmentSchema = Joi.object({
  originId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.guid": "El ID de origen debe ser un UUID válido",
      "any.required": "El ID de origen es obligatorio",
      "string.empty": "El ID de origen no puede estar vacío"
    }),

  destinationId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.guid": "El ID de destino debe ser un UUID válido",
      "any.required": "El ID de destino es obligatorio",
      "string.empty": "El ID de destino no puede estar vacío"
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
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "El precio debe ser un número",
      "number.positive": "El precio debe ser un valor positivo",
      "any.required": "El precio es obligatorio"
    })
})
  .required()
  .unknown(false);
