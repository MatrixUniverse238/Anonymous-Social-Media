// server/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isReported: { type: Boolean, default: false },
    isRemoved:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Index for fast comment lookup by post ──
commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);