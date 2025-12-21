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


router.post(
  "/",
  authenticateToken,
  validateSchema(addShipmentStatusSchema, "body"),
  async (req, res, next) => shipmentStatusHistoryController.addStatus(req, res, next)
);

router.get(
  "/:shipmentId/tracking",
  authenticateToken,
  async (req, res, next) => shipmentStatusHistoryController.getTracking(req, res, next)
);

export { router as shipmentStatusHistoryRoutes };
