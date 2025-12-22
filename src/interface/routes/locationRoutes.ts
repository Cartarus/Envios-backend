import { Router } from "express";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { GetLocations } from "../../use-cases/location/GetLocations";
import { LocationController } from "../controllers/LocationController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { RedisLocationCacheRepository } from '../../infrastructure/cahe/RedisLocationCacheRepository';

const router = Router();

const locationRepository = new PostgresLocationRepository();
const redisLocationCacheRepository = new RedisLocationCacheRepository();
const getLocations = new GetLocations(locationRepository, redisLocationCacheRepository);
const locationController = new LocationController(getLocations);

router.get("/",authenticateToken ,async (req, res, next) =>
  locationController.getAllLocations(req, res, next)
);

export { router as locationRoutes };
