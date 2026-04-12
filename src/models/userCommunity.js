import { Schema, model } from "mongoose";

const userCommunitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: "Community",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});
userCommunitySchema.index({ user: 1, community: 1 }, { unique: true }); //this will ensure that a user can join a community only once
export const UserCommunity = model("UserCommunity", userCommunitySchema);
