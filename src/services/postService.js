import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { UserCommunity } from "../models/userCommunity.js";
import { Vote } from "../models/Vote.js";
const createPostService = async (
  userId,
  communityId,
  title,
  content,
  postImg,
) => {
  //First See if the user is a member of community
  const isMember = await UserCommunity.findOne({
    user: userId,
    community: communityId,
  });
  if (!isMember) {
    throw new Error("You must be a member of the community to create a post");
  }
  //If user is a member then create the post
  const post = new Post({
    userId,
    communityId,
    title,
    content,
    postImg,
  });
  await post.save();
  return post;
};
const getSinglePostService = async (postId) => {
  const post = await Post.findById(postId)
    .populate("userId", "username profile")
    .populate("communityId", "name")
    .lean();
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};
const votePostService = async (postId, userId, voteType) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post does not exist");
  }
  const existingVote = await Vote.findOne({ postId, userId });
  if (existingVote) {
    //If ther user has already voted
    if (existingVote.voteType === voteType) {
      //If the is user is voting the same way then remove the vote
      await Vote.findOneAndDelete({ postId, userId });
      if (voteType === "upvote") {
        await Post.findByIdAndUpdate(postId, {
          $inc: { upvotes: -1 },
        });
      }
      if (voteType === "downvote") {
        await Post.findByIdAndUpdate(postId, {
          $inc: { downvotes: -1 },
        });
      }
    } else {
      //they are switching their vote
      if (voteType === "upvote") {
        await Vote.findOneAndUpdate({ postId, userId }, { voteType: "upvote" });
        await Post.findByIdAndUpdate(postId, {
          $inc: { upvotes: 1, downvotes: -1 },
        });
      } else if (voteType === "downvote") {
        await Vote.findOneAndUpdate(
          { postId, userId },
          { voteType: "downvote" },
        );
        await Post.findByIdAndUpdate(postId, {
          $inc: { upvotes: -1, downvotes: 1 },
        });
      }
    }
  } else {
    //it's a brand new vote
    const vote = new Vote({
      userId,
      postId,
      voteType,
    });
    await vote.save();
    await Post.findByIdAndUpdate(postId, {
      $inc: voteType === "upvote" ? { upvotes: 1 } : { downvotes: 1 },
    });
  }
  const updatedPost = await Post.findById(postId);
  return updatedPost;
};

const getHomeFeedPostsService = async (cursor, limit) => {
  //Get the communities on the nome page
  let query = {};
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("userId", "username")
    .populate("communityId", "name")
    .lean();
  const hasMore = posts.length > limit;
  if (hasMore) {
    posts.pop();
  }
  const newCursor = hasMore ? posts[posts.length - 1]._id : null;
  return { posts, newCursor, hasMore };
};

const deletePostService = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post does not exist");
  }
  if (post.userId.toString() !== userId) {
    throw new Error("You are not authorized to delete this post");
  }
  //Query Optimization using promise.all
  await Promise.all([
    Post.findByIdAndDelete(postId),
    Comment.deleteMany({ postId }),
    Vote.deleteMany({ postId }),
  ]);
};
export {
  createPostService,
  votePostService,
  getSinglePostService,
  getHomeFeedPostsService,
  deletePostService,
};
