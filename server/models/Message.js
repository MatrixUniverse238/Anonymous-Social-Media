// server/models/Message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Message cannot be empty"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // NEW: message status
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // moderation flags
    isReported: {
      type: Boolean,
      default: false,
    },

    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Index for inbox queries ──
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);