import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  createCommunityController,
  joinCommunityController,
} from "../controllers/communityController.js";

const router = express.Router();

//Create community route
router.post("/", protectRoute, createCommunityController);

//Join Community route
router.post("/:communityId/join", protectRoute, joinCommunityController);
export default router;
