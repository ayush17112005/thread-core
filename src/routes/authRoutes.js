import express from "express";
import {
  loginUser,
  registerUser,
  getMe,
} from "../controllers/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();

//Register route
router.post("/register", registerUser);
//Login route
router.post("/login", loginUser);

router.get("/me", protectRoute, getMe);

export default router;
