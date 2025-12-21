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

const router = Router();

const shipmentRepository = new PostgresShipmentRepository();
const shipmentStatusHistoryRepository = new PostgresShipmentStatusHistory();
const createShipment = new CreateShipment(shipmentRepository);
const listUserShipments = new ListUserShipments(shipmentRepository);
const getShipmentById = new GetShipmentById(shipmentRepository);
const addShipmentStatus = new AddShipmentStatus(
  shipmentStatusHistoryRepository,
  shipmentRepository
);

const shipmentController = new ShipmentController(
  createShipment,
  listUserShipments,
  getShipmentById,
  addShipmentStatus
);

router.post(
  "/",
  authenticateToken,
  validateSchema(createShipmentSchema),
  async (req, res, next) => shipmentController.storeShipment(req, res, next)
);

router.get("/", authenticateToken, async (req, res, next) =>
  shipmentController.getUserShipments(req, res, next)
);

router.get(
  "/:shipmentId",
  authenticateToken,
  validateSchema(getShipmentByIdSchema, "params"),
  async (req, res, next) => shipmentController.getShipment(req, res, next)
);

export { router as shipmentRoutes };
