import { Router } from "express";
import { RateController } from "../controllers/RateController";
import { PostgresRateRepository } from "../../infrastructure/repositories/PostgresRateRepository";
import { GetRate } from "../../use-cases/quote/GetRate";
import { authenticateToken } from "../middlewares/authenticateToken";
import { getRateSchema } from "../../validators/rateValidators";
import { validateSchema } from "../middlewares/validateSchema";

const router = Router();

const rateRepository = new PostgresRateRepository();
const getRate = new GetRate(rateRepository);

const rateController = new RateController(getRate);

/**
 * @swagger
 * /api/rate:
 *   post:
 *     summary: Obtener cotización de envío
 *     description: Calcula la tarifa de envío basada en origen, destino y peso
 *     tags: [Rates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originId
 *               - destinationId
 *               - weight
 *             properties:
 *               originId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               destinationId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *               weight:
 *                 type: number
 *                 minimum: 0.1
 *                 example: 5.5
 *     responses:
 *       200:
 *         description: Cotización calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     rate:
 *                       type: number
 *                       example: 150.50
 *                     currency:
 *                       type: string
 *                       example: MXN
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontró tarifa para la ruta especificada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  authenticateToken,
  validateSchema(getRateSchema),
  async (req, res, next) => rateController.getQuote(req, res, next)
);

export { router as rateRoutes };
