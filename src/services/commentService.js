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

const getPostCommentsService = async (postId, cursor, limit) => {
  if (!postId) {
    throw new Error("Post Id is required");
  }
  let query = {
    postId,
    parentComment: null, //only fetch top level comments
  };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  //Now fetch Comments
  const comments = await Comment.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("userId", "username")
    .lean(); //use lean for faster queries since we don't need mongoose document methods here
  const hasMore = comments.length > limit;
  if (hasMore) {
    comments.pop(); //remove the extra comment
  }
  const newCursor = hasMore ? comments[comments.length - 1]._id : null;

  //Fetch toplevel ids
  const topLevelId = comments.map((c) => c._id);
  const replies = await Comment.find({
    parentComment: { $in: topLevelId },
  })
    .populate("userId", "username")
    .lean();

  //Attach the replies to their respective parent comments
  const commentWithReplies = comments.map((c) => ({
    ...c, //put this comment first
    c_replies: replies.filter(
      (r) => r.parentComment.toString() === c._id.toString(),
    ), //then attach the replies to this comment
  }));
  return { comments: commentWithReplies, newCursor, hasMore };
};

export { createCommentService, getPostCommentsService };
