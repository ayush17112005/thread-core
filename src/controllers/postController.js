import { uploadToCloudinaryService } from "../services/uploadService.js";
import {
  createPostService,
  votePostService,
  getSinglePostService,
  getHomeFeedPostsService,
  deletePostService,
  savePostService,
} from "../services/postService.js";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors/customErrors.js";
import { catchAsync } from "../utils/catchAsync.js";

const createPostController = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }

  const communityId = req.params.communityId;
  if (!communityId) {
    throw new NotFoundError("Community does not exist");
  }

  const { title, content } = req.body;
  if (!title || !content) {
    throw new ValidationError("Title and content are required");
  }

  let imageUrl = null;

  // If image exists → upload to cloudinary
  if (req.file) {
    const result = await uploadToCloudinaryService(req.file.buffer);
    imageUrl = result.secure_url;
  }

  // Create post
  const post = await createPostService(
    userId,
    communityId,
    title,
    content,
    imageUrl,
  );

  return res.status(201).json({
    message: "Post created successfully",
    post,
  });
});
const getSinglePostController = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId) {
    throw new NotFoundError("Post does not exist");
  }
  const post = await getSinglePostService(postId);
  return res.status(200).json({ success: true, post: post });
});
const votePostController = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const voteType = req.body.voteType; // "upvote" or "downvote"

  //but this check doesn't have any meaning as from the frontend there are two arrows only:)
  //but we will not trust the frontend and will do the check here as well
  if (!["upvote", "downvote"].includes(voteType)) {
    throw new ValidationError("Invalid vote type");
  }
  if (!userId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }
  if (!postId) {
    throw new NotFoundError("Post does not exist");
  }
  const updatePost = await votePostService(postId, userId, voteType);
  return res
    .status(200)
    .json({ message: "Vote recorded successfully", post: updatePost });
});
const getHomeFeedPostsController = catchAsync(async (req, res, next) => {
  const cursor = req.query.cursor || null;
  const limit = parseInt(req.query.limit) || 10;
  const { posts, newCursor, hasMore } = await getHomeFeedPostsService(
    cursor,
    limit,
  );
  return res.status(200).json({
    success: true,
    message: "Global feed fetched successfully",
    posts,
    nextCursor: newCursor,
    hasMore,
  });
});
const deletePostController = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  if (!postId) {
    throw new NotFoundError("Post does not exist");
  }
  if (!userId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }
  await deletePostService(postId, userId);
  return res.status(200).json({ message: "Post deleted successfully" });
});

const savePostController = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  if (!postId) {
    throw new NotFoundError("Post does not exist");
  }
  if (!userId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }
  const result = await savePostService(userId, postId);
  res.status(200).json({
    success: true,
    message: result.action === "saved" ? "Post saved" : "Post unsaved",
    action: result.action,
  });
});

export {
  createPostController,
  votePostController,
  getSinglePostController,
  getHomeFeedPostsController,
  deletePostController,
  savePostController,
};
