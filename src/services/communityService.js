import { Community } from "../models/Community.js";
import { UserCommunity } from "../models/userCommunity.js";
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

export { createCommunityService };
