import 'dotenv/config';
import express from "express";
import { userRoutes } from "./interface/routes/userRoutes";

const app = express();

app.use(express.json());
app.use("/api", userRoutes);
app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});