import { Post } from "../models/Post.js";
import { UserCommunity } from "../models/userCommunity.js";
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

export { createPostService };
