import { Router } from "express";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { CreateShipment } from '../../use-cases/shipment/CreateShipment';
import { ShipmentController } from "../controllers/ShipmentController";
import { Shipment } from '../../domain/entities/Shipment';
import { authenticateToken } from "../middlewares/authenticateToken";
import { validateSchema } from "../middlewares/validateSchema";
import { createShipmentSchema } from "../../validators/shipmentValidators";

const router = Router()

const shipmentRepository = new PostgresShipmentRepository();
const createShipment = new CreateShipment(shipmentRepository);

const shipmentController = new ShipmentController(createShipment);

router.post("/" ,authenticateToken,validateSchema(createShipmentSchema),async (req, res, next) => shipmentController.storeShipment(req, res, next));

export { router as shipmentRoutes };
