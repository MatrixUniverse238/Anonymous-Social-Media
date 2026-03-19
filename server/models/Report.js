// server/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['post', 'comment', 'message'],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,     // ID of the reported post/comment/message
      refPath: 'contentType', // dynamic ref based on contentType
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'hate_speech',
        'misinformation',
        'inappropriate',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);