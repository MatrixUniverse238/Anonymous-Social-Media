const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    body: {
      type: String,
      required: [true, "Body is required"],
      minlength: [10, "Body must be at least 10 characters"],
      maxlength: [5000, "Body cannot exceed 5000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },

    /* ⭐ MEDIA FIELD (IMAGE / VIDEO) */
    media: {
      type: String,
      default: null, // example: "/uploads/1742342342-image.jpg"
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    views: {
      type: Number,
      default: 0,
    },

    isReported: {
      type: Boolean,
      default: false,
    },

    isRemoved: {
      type: Boolean,
      default: false,
    },

    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

/* ── Virtual: upvote count ── */
postSchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});

/* ── Virtual: comment count ── */
postSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  count: true,
});

/* ── Index for performance ── */
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);