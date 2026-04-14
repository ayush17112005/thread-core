import { User } from "../models/userSchema.js";
import { Comment } from "../models/Comment.js";
import { Community } from "../models/Community.js";
import { Post } from "../models/Post.js";
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
    throw new Error("User not found");
  }
  if (!community) {
    throw new Error("Community not found");
  }

  if (!post) {
    throw new Error("Post not found");
  }
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new Error("Parent Comment not found");
    }
    if (parentComment.postId.toString() !== postId) {
      throw new Error("Parent Comment does not belong to this post");
    }
  }
  const newComment = new Comment({
    content,
    userId,
    postId,
    communityId,
    parentComment: parentCommentId || null,
  });
  await newComment.save();
  return newComment;
};

export { createCommentService };
