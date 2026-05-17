import { Schema, model } from "mongoose";

const savePostsSchema = new Schema(
  {
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
  },
  { timestamps: true },
);

//This index will ensure that user can't save a post twice
savePostsSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavePosts = model("SavePosts", savePostsSchema);
