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

router.post(
  "/",
  authenticateToken,
  validateSchema(getRateSchema),
  async (req, res, next) => rateController.getQuote(req, res, next)
);

export { router as rateRoutes };
