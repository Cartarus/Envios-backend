import Joi from "joi";

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .required()
  .messages({
    "string.min": "La contraseña debe tener al menos 8 caracteres",
    "string.pattern.base":
      "La contraseña debe incluir mayúsculas, minúsculas y números",
    "any.required": "La contraseña es obligatoria",
    "string.empty": "La contraseña no puede estar vacía"
  });

export const registerUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.min": "El nombre debe tener al menos 3 caracteres",
      "string.max": "El nombre no puede superar los 50 caracteres",
      "any.required": "El nombre es obligatorio"
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "El email no es válido",
      "any.required": "El email es obligatorio"
    }),

  password: passwordSchema
})
  .required()
  .unknown(false);
