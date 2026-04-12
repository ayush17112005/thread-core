import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { createCommunityController } from "../controllers/communityController.js";

const router = express.Router();

//Create community route
router.post("/", protectRoute, createCommunityController);

export default router;
