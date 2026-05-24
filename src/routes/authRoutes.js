import express from "express";
import {
  loginUser,
  registerUser,
  getMe,
  refreshAccessToken,
  logOut,
} from "../controllers/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();

//Register route
router.post("/register", registerUser);
//Login route
router.post("/login", loginUser);
router.post("/logout", logOut);
//Return new access token when the old one expires
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protectRoute, getMe);

export default router;
