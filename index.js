import express from "express";
import { connectDB } from "./src/configs/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import communityRoutes from "./src/routes/communityRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
await connectDB();
app.get("/", (req, res) => {
  res.send("Health check successful!");
});
app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/posts", postRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
