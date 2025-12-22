import Joi from "joi";

export const addShipmentStatusSchema = Joi.object({
  shipmentId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.guid": "El ID del envío debe ser un UUID válido",
      "any.required": "El ID del envío es obligatorio",
      "string.empty": "El ID del envío no puede estar vacío"
    }),

  status: Joi.string()
    .required()
    .valid('PENDING', 'IN_TRANSIT', 'DELIVERED')
    .messages({
      "string.base": "El estado debe ser un texto",
      "any.required": "El estado es obligatorio",
      "string.empty": "El estado no puede estar vacío",
      "any.only": "El estado debe ser uno de: PENDING, IN_TRANSIT, DELIVERED"
    }),

  locationId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.guid": "El ID de ubicación debe ser un UUID válido",
      "any.required": "El ID de ubicación es obligatorio",
      "string.empty": "El ID de ubicación no puede estar vacío"
    })
})
  .required()
  .unknown(false);



