const mongoose = require("mongoose");

const FeedPostSchema = new mongoose.Schema(
  {
    feedId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      default: () => Date.now() + Math.floor(Math.random() * 1000),
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
      maxlength: 200,
    },
    recipientIds: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.FeedPost || mongoose.model("FeedPost", FeedPostSchema);
