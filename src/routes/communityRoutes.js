import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  createCommunityController,
  joinCommunityController,
  getCommunityFeedController,
} from "../controllers/communityController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { createPostController } from "../controllers/postController.js";
import {
  createCommentController,
  getPostCommentsController,
} from "../controllers/commentController.js";
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

//Get the community Feed
router.get("/:communityId/posts", getCommunityFeedController);

//Comment on a community post
router.post(
  "/:communityId/posts/:postId/comments",
  protectRoute,
  createCommentController,
);
//Get comments for a post
router.get("/:communityId/posts/:postId/comments", getPostCommentsController);
export default router;
