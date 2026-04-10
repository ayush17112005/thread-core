import express from "express";
import { connectDB } from "./src/configs/db.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());
const port = process.env.PORT || 3000;
await connectDB();
app.get("/", (req, res) => {
  res.send("Health check successful!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
