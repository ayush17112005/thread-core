import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "like",
        "comment",
        "comment_reply",
        "community_join",
        "community_kick",
      ],
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityModel",
    },

    entityModel: {
      type: String,
      required: true,
      enum: ["Post", "Comment", "Community"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

export const Notification = model("Notification", notificationSchema);
