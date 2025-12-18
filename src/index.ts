import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});