import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    communityId: {
      //As such this field is not strictly required but it might be useful to increase some query performance
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", //Self referencing relationship :)
      default: null,
    },
    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Comment = model("Comment", commentSchema);
