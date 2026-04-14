import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { votePostController } from "../controllers/postController.js";
import {
  getSinglePostController,
  getHomeFeedPostsController,
} from "../controllers/postController.js";
const router = express.Router();

//Upvote or downvote a post
router.post("/:postId/vote", protectRoute, votePostController);
router.get("/:postId", getSinglePostController);
router.get("/", getHomeFeedPostsController);
export default router;
