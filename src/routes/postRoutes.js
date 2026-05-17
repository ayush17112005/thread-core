import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { votePostController } from "../controllers/postController.js";
import {
  getSinglePostController,
  getHomeFeedPostsController,
  deletePostController,
  savePostController,
} from "../controllers/postController.js";
const router = express.Router();

//Upvote or downvote a post
router.post("/:postId/vote", protectRoute, votePostController);
router.post("/:postId/save", protectRoute, savePostController);
router.get("/:postId", getSinglePostController);
router.get("/", getHomeFeedPostsController);
router.delete("/:postId", protectRoute, deletePostController);

export default router;
