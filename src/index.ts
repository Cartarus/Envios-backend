import 'dotenv/config';
import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import { userRoutes } from "./interface/routes/userRoutes";
import { rateRoutes } from "./interface/routes/rateRoutes";
import { errorHandler } from "./interface/middlewares/errorHandler";
import { locationRoutes } from './interface/routes/locationRoutes';
import { shipmentRoutes } from './interface/routes/shipmentRoutes';
import { shipmentStatusHistoryRoutes } from './interface/routes/ShipmentStatusHistoryRoutes';
import { connectRedis } from './infrastructure/cahe/redisClient';
import { swaggerSpec } from './infrastructure/config/swagger';

await connectRedis();


const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Envíos - Documentación'
}));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use("/api/auth", userRoutes);
app.use("/api/rate", rateRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/shipment-status", shipmentStatusHistoryRoutes);
app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});