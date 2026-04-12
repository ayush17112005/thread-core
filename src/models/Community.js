import { Schema, model } from "mongoose";

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    communityProfile: {
      type: String,
      default: "",
    },
    membersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Community = model("Community", communitySchema);
