import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  createCommunityController,
  joinCommunityController,
} from "../controllers/communityController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { createPostController } from "../controllers/postController.js";

const router = express.Router();

//Create community route
router.post("/", protectRoute, createCommunityController);

//Join Community route
router.post("/:communityId/join", protectRoute, joinCommunityController);

//Create a post in a community
router.post(
  "/:communityId/posts",
  protectRoute,
  upload.single("image"),
  createPostController,
);
export default router;
