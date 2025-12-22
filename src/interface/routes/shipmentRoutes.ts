import { Router } from "express";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { CreateShipment } from "../../use-cases/shipment/CreateShipment";
import { ShipmentController } from "../controllers/ShipmentController";
import { Shipment } from "../../domain/entities/Shipment";
import { authenticateToken } from "../middlewares/authenticateToken";
import { validateSchema } from "../middlewares/validateSchema";
import {
  createShipmentSchema,
  getShipmentByIdSchema,
} from "../../validators/shipmentValidators";
import { ListUserShipments } from "../../use-cases/shipment/listUserShipments";
import { GetShipmentById } from "../../use-cases/shipment/GetShipmentById";
import { AddShipmentStatus } from "../../use-cases/shipmentStatus/AddShipmentStatus";
import { PostgresShipmentStatusHistory } from "../../infrastructure/repositories/PostgresShipmentStatusHistory";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { GetShipmentTracking } from "../../use-cases/shipmentStatus/GetShipmentTracking";

const router = Router();

const shipmentRepository = new PostgresShipmentRepository();
const shipmentStatusHistoryRepository = new PostgresShipmentStatusHistory();
const locationRepository = new PostgresLocationRepository();
const createShipment = new CreateShipment(shipmentRepository);
const listUserShipments = new ListUserShipments(shipmentRepository);
const getShipmentById = new GetShipmentById(shipmentRepository);
const addShipmentStatus = new AddShipmentStatus(
  shipmentStatusHistoryRepository,
  shipmentRepository,
  locationRepository
);
const getShipmentTracking = new GetShipmentTracking(
  shipmentStatusHistoryRepository
);

const shipmentController = new ShipmentController(
  createShipment,
  listUserShipments,
  getShipmentById,
  addShipmentStatus,
  getShipmentTracking
);

/**
 * @swagger
 * /api/shipment:
 *   post:
 *     summary: Crear un nuevo envío
 *     description: Crea un nuevo envío para el usuario autenticado
 *     tags: [Shipments]
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
 *       201:
 *         description: Envío creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
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
  validateSchema(createShipmentSchema),
  async (req, res, next) => shipmentController.storeShipment(req, res, next)
);

/**
 * @swagger
 * /api/shipment:
 *   get:
 *     summary: Listar envíos del usuario
 *     description: Obtiene todos los envíos del usuario autenticado
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de envíos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", authenticateToken, async (req, res, next) =>
  shipmentController.getUserShipments(req, res, next)
);

/**
 * @swagger
 * /api/shipment/{shipmentId}:
 *   get:
 *     summary: Obtener envío por ID
 *     description: Obtiene los detalles de un envío específico
 *     tags: [Shipments]
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
 *         description: Envío obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
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
  validateSchema(getShipmentByIdSchema, "params"),
  async (req, res, next) => shipmentController.getShipment(req, res, next)
);

export { router as shipmentRoutes };
