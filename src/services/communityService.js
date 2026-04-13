import { Community } from "../models/Community.js";
import { UserCommunity } from "../models/userCommunity.js";
import { Post } from "../models/Post.js";
const createCommunityService = async (name, adminId, description) => {
  // 1. Force lowercase and replace all spaces with underscores
  const formattedName = name.trim().toLowerCase().replace(/\s+/g, "_");

  //If commnity with same name already there
  const existingCommunity = await Community.findOne({
    name: formattedName,
  });
  if (existingCommunity) {
    throw new Error("Community name already taken");
  }
  const newCommunity = new Community({
    name: formattedName,
    admin: adminId,
    description,
    membersCount: 1,
  });
  await newCommunity.save();

  //Update the UserCommunity collection to reflect that the admin is also a member of the community
  const newMemberLink = new UserCommunity({
    user: adminId,
    community: newCommunity._id,
  });
  await newMemberLink.save();
  return newCommunity;
};

const joinCommunityService = async (communityId, userId) => {
  //see if the community exists
  const community = await Community.findById(communityId);
  if (!community) {
    throw new Error("Community does not exist");
  }
  //see if the user is already a member
  const existingLink = await UserCommunity.findOne({
    user: userId,
    community: communityId,
  });
  if (existingLink) {
    throw new Error("User already a member of this community");
  }
  //Now if all okay then create a link between user and community
  const newMemberLink = new UserCommunity({
    user: userId,
    community: communityId,
  });
  await newMemberLink.save();
  /*
  community.membersCount += 1; 
  by updating the members count like this we will have race condition problem because if two users try to join at the same time then both will read the same membersCount and then both will update it to same value + 1 so we will end up with wrong members count. To avoid this we will use atomic operator $inc which will ensure that even if two users try to join at the same time then the membersCount will be updated correctly without any
  */
  //This solves the race condition problem and ensures that membersCount is always accurate even when multiple users are joining the community simultaneously.
  await Community.findByIdAndUpdate(communityId, {
    $inc: { membersCount: 1 },
  });
  return community;
};

const getCommunityFeedService = async (communityId, cursor, limit) => {
  const query = {
    communityId,
  };
  if (cursor) {
    query._id = { $lt: cursor };
  }

  //Now Fetch posts
  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("userId", "username")
    .populate("communityId", "name");

  //check if more posts are there
  const hasMore = posts.length > limit;
  if (hasMore) {
    posts.pop(); //remove the extra post
  }
  //set the cursor to the last post id
  const newCursor = hasMore ? posts[posts.length - 1]._id : null;
  return { posts, newCursor, hasMore };
};

export {
  createCommunityService,
  joinCommunityService,
  getCommunityFeedService,
};
