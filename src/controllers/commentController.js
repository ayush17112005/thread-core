import {
  createCommentService,
  getPostCommentsService,
} from "../services/commentService.js";
import { ValidationError } from "../utils/errors/customErrors.js";
import { catchAsync } from "../utils/catchAsync.js";
const createCommentController = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const content = req.body.content;
  const postId = req.params.postId;
  const communityId = req.params.communityId;
  const parentCommentId = req.body.parentCommentId; // This is optional for top-level comments
  if (!content) {
    throw new ValidationError("Please provide content for the comment");
  }
  const newComment = await createCommentService(
    content,
    userId,
    postId,
    communityId,
    parentCommentId,
  );
  res.status(201).json({
    message: "Comment Created Successfully",
    comment: await newComment.populate("userId", "username"),
  });
});

const getPostCommentsController = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const cursor = req.query.cursor || null;
  const limit = parseInt(req.query.limit) || 10;
  const { comments, newCursor, hasMore } = await getPostCommentsService(
    postId,
    cursor,
    limit,
  );
  res.status(200).json({
    message: "Comments fetched successfully",
    comments,
    nextCursor: newCursor,
    hasMore,
  });
});

export { createCommentController, getPostCommentsController };
