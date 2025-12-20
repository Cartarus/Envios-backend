import 'dotenv/config';
import express from "express";
import cors from "cors";
import { userRoutes } from "./interface/routes/userRoutes";
import { rateRoutes } from "./interface/routes/rateRoutes";
import { errorHandler } from "./interface/middlewares/errorHandler";

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", rateRoutes);
app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});