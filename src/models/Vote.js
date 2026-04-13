import { Schema, model } from "mongoose";
const voteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  voteType: {
    type: String,
    enum: ["upvote", "downvote"],
  },
});

voteSchema.index({ userId: 1, postId: 1 }, { unique: true }); // Ensure a user can only vote once per post
export const Vote = model("Vote", voteSchema);
