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

/**
 * @swagger
 * /api/location:
 *   get:
 *     summary: Obtener todas las ubicaciones
 *     description: Retorna una lista de todas las ubicaciones disponibles para envíos
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ubicaciones obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Location'
 *       401:
 *         description: No autorizado - Token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontraron ubicaciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/",authenticateToken ,async (req, res, next) =>
  locationController.getAllLocations(req, res, next)
);

export { router as locationRoutes };
