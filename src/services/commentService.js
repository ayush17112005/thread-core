import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import { Comment } from "../models/Comment.js";
import { Community } from "../models/Community.js";
import { Post } from "../models/Post.js";
import {
  NotFoundError,
  ValidationError,
} from "../utils/errors/customErrors.js";
const createCommentService = async (
  content,
  userId,
  postId,
  communityId,
  parentCommentId,
) => {
  /*
    Instead of making multiple queries to check if the user, community and post exist we can use Promise.all to run them in parallel which can improve query performance
  const user = await User.findById(userId);
  const community = await Community.findById(communityId);
  const post = await Post.findById(postId);
  */
  const [user, community, post] = await Promise.all([
    User.findById(userId),
    Community.findById(communityId),
    Post.findById(postId),
  ]);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (!community) {
    throw new NotFoundError("Community not found");
  }

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const newCommentId = new mongoose.Types.ObjectId(); //Generate id before creating comment
  let pathString = "";
  if (!parentCommentId) {
    //It's a root comment
    //Path = postId.commentId
    pathString = `${postId.toString()}.${newCommentId.toString()}`;
  } else {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new NotFoundError("Parent comment not found");
    }
    pathString = `${parentComment.path.toString()}.${newCommentId.toString()}`;
  }

  const newComment = new Comment({
    _id: newCommentId, //use this pre-generated id for the comment
    content,
    userId,
    postId,
    communityId,
    parentComment: parentCommentId || null,
    path: pathString,
  });
  await newComment.save();
  return newComment;
};

const getPostCommentsService = async (postId, cursor, limit = 10) => {
  if (!postId) {
    throw new ValidationError("Post Id is required");
  }
  let rootQuery = {
    postId,
    parentComment: null, //only fetch top level comments
  };
  if (cursor) {
    rootQuery._id = { $lt: cursor };
  }
  //Step1: Now fetch all the root Comments(comments with parentComment = null)
  const rootComments = await Comment.find(rootQuery)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("userId", "username")
    .lean(); //use lean for faster queries since we don't need mongoose document methods here
  const hasMore = rootComments.length > limit;
  if (hasMore) {
    rootComments.pop(); //remove the extra comment
  }
  const newCursor = hasMore ? rootComments[rootComments.length - 1]._id : null;

  //If no comments just return early
  if (rootComments.length === 0) {
    return { comments: [], newCursor: null, hasMore: false };
  }

  //Step2: Fetch all the child comments(descendants)
  //Since our path looks like A.B.C.D and '.' this is a special character in regex we need to escape it like this A\.B\.C\.D
  const rootPaths = rootComments.map((r) => r.path.replace(/\./g, "\\.")); //note js treat \\. as \. in final regex
  const regexPattern = `^(${rootPaths.join("|")})\\.`;

  const descendants = await Comment.find({
    postId,
    path: { $regex: regexPattern },
  })
    .sort({ path: 1 })
    .populate("userId", "username")
    .limit(300)
    .lean();

  //Step3: Assemble the infinite tree
  const allComments = [...rootComments, ...descendants];
  const commentMap = {};

  allComments.forEach((comment) => {
    commentMap[comment._id.toString()] = { ...comment, replies: [] };
  });

  const finalTree = [];

  //Combine them together
  allComments.forEach((comment) => {
    if (comment.parentComment) {
      const parentId = comment.parentComment.toString();
      if (commentMap[parentId]) {
        commentMap[parentId].replies.push(commentMap[comment._id.toString()]);
      }
    } else {
      finalTree.push(commentMap[comment._id.toString()]);
    }
  });

  return { comments: finalTree, newCursor, hasMore };
};

export { createCommentService, getPostCommentsService };
