import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Health check successful!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
