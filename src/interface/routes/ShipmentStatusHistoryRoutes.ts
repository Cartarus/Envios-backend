import { Router } from "express";

import { PostgresShipmentStatusHistory } from "../../infrastructure/repositories/PostgresShipmentStatusHistory";
import { AddShipmentStatus } from "../../use-cases/shipmentStatus/AddShipmentStatus";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { GetShipmentTracking } from "../../use-cases/shipmentStatus/GetShipmentTracking";
import { ShipmentStatusHistoryController } from '../controllers/ShimpmentStatusHistoryController';
import { authenticateToken } from "../middlewares/authenticateToken";
import { validateSchema } from "../middlewares/validateSchema";
import { addShipmentStatusSchema } from "../../validators/shipmentStatushistoryValidators";
import { LocationRepository } from '../../domain/interfaces/LocationRepository';
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";

const  router = Router();

const shipmentStatusHistoryRepository = new PostgresShipmentStatusHistory();
const shipmentRepository = new PostgresShipmentRepository();
const locationRepository = new PostgresLocationRepository();

const addShipmentStatus = new AddShipmentStatus(shipmentStatusHistoryRepository, shipmentRepository, locationRepository);
const getShipmentTracking = new GetShipmentTracking(shipmentStatusHistoryRepository);

const shipmentStatusHistoryController = new ShipmentStatusHistoryController(addShipmentStatus, getShipmentTracking);

/**
 * @swagger
 * /api/shipment-status:
 *   post:
 *     summary: Agregar estado al envío
 *     description: Registra un nuevo estado en el historial del envío
 *     tags: [Shipment Status]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipmentId
 *               - status
 *               - locationId
 *             properties:
 *               shipmentId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               status:
 *                 type: string
 *                 enum: [pendiente, en_transito, entregado, cancelado]
 *                 example: en_transito
 *               locationId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               description:
 *                 type: string
 *                 example: Paquete en tránsito hacia destino
 *     responses:
 *       201:
 *         description: Estado agregado exitosamente
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
 */
router.post(
  "/",
  authenticateToken,
  validateSchema(addShipmentStatusSchema, "body"),
  async (req, res, next) => shipmentStatusHistoryController.addStatus(req, res, next)
);

/**
 * @swagger
 * /api/shipment-status/{shipmentId}:
 *   get:
 *     summary: Obtener historial de seguimiento
 *     description: Obtiene el historial completo de estados de un envío
 *     tags: [Shipment Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del envío
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       shipmentId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       locationId:
 *                         type: string
 *                       description:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:shipmentId",
  authenticateToken,
  async (req, res, next) => shipmentStatusHistoryController.getTracking(req, res, next)
);

export { router as shipmentStatusHistoryRoutes };
