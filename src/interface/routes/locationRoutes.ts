import { Router } from "express";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { GetLocations } from "../../use-cases/location/GetLocations";
import { LocationController } from "../controllers/LocationController";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

const locationRepository = new PostgresLocationRepository();
const getLocations = new GetLocations(locationRepository);
const locationController = new LocationController(getLocations);

router.get("/",authenticateToken ,async (req, res, next) =>
  locationController.getAllLocations(req, res, next)
);

export { router as locationRoutes };
