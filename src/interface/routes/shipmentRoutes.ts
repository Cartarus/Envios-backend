import { Router } from "express";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { CreateShipment } from '../../use-cases/shipment/CreateShipment';
import { ShipmentController } from "../controllers/ShipmentController";
import { Shipment } from '../../domain/entities/Shipment';
import { authenticateToken } from "../middlewares/authenticateToken";
import { validateSchema } from "../middlewares/validateSchema";
import { createShipmentSchema } from "../../validators/shipmentValidators";
import { ListUserShipments } from "../../use-cases/shipment/listUserShipments";

const router = Router()

const shipmentRepository = new PostgresShipmentRepository();
const createShipment = new CreateShipment(shipmentRepository);
const listUserShipments = new ListUserShipments(shipmentRepository);

const shipmentController = new ShipmentController(createShipment, listUserShipments);

router.post("/" ,authenticateToken,validateSchema(createShipmentSchema),async (req, res, next) => shipmentController.storeShipment(req, res, next));
router.get("/", authenticateToken, async (req, res, next) => shipmentController.getUserShipments(req, res, next));

export { router as shipmentRoutes };
