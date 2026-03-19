// server/controllers/postController.js
const Post    = require('../models/Post');
const Comment = require('../models/Comment');

// ── @desc    Get all posts (feed)
// ── @route   GET /api/posts
// ── @access  Public
const getPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const tag   = req.query.tag;

    // Build filter
    const filter = { isRemoved: false };
    if (tag) filter.tags = tag;

    const posts = await Post.find(filter)
      .populate({
        path: 'author',
        select: 'username avatar', // only return these fields
      })
      .sort({ createdAt: -1 })     // newest first
      .skip(skip)
      .limit(limit);

    // Hide author if post is anonymous
    const sanitized = posts.map((post) => {
      const p = post.toJSON();
      if (p.isAnonymous) p.author = { username: 'Anonymous' };
      return p;
    });

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: sanitized.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts: sanitized,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get single post
// ── @route   GET /api/posts/:id
// ── @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'author',
      select: 'username avatar',
    });

    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    const p = post.toJSON();
    if (p.isAnonymous) p.author = { username: 'Anonymous' };

    res.status(200).json({ success: true, post: p });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Create a post
// ── @route   POST /api/posts
// ── @access  Private
const createPost = async (req, res) => {
  try {
    const { title, body, tags, isAnonymous } = req.body;

    const post = await Post.create({
      title,
      body,
      tags:        tags || [],
      isAnonymous: isAnonymous || false,
      author:      req.user._id, // from protect middleware
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Delete a post
// ── @route   DELETE /api/posts/:id
// ── @access  Private (own post or admin)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only author or admin can delete
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete — keeps data for moderation audit
    post.isRemoved = true;
    await post.save();

    res.status(200).json({ success: true, message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Upvote / un-upvote a post (toggle)
// ── @route   PUT /api/posts/:id/upvote
// ── @access  Private
const upvotePost = async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id);
    const userId = req.user._id.toString();

    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyUpvoted = post.upvotes
      .map((id) => id.toString())
      .includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote (toggle off)
      post.upvotes = post.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add upvote and remove downvote if exists
      post.upvotes.push(req.user._id);
      post.downvotes = post.downvotes.filter(
        (id) => id.toString() !== userId
      );
    }

    await post.save();

    res.status(200).json({
      success: true,
      upvotes:   post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Add comment to post
// ── @route   POST /api/posts/:id/comments
// ── @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      body:        req.body.body,
      author:      req.user._id,
      post:        post._id,
      isAnonymous: req.body.isAnonymous || false,
    });

    await comment.populate({ path: 'author', select: 'username avatar' });

    const c = comment.toJSON();
    if (c.isAnonymous) c.author = { username: 'Anonymous' };

    res.status(201).json({ success: true, comment: c });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get comments for a post
// ── @route   GET /api/posts/:id/comments
// ── @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post:      req.params.id,
      isRemoved: false,
    })
      .populate({ path: 'author', select: 'username avatar' })
      .sort({ createdAt: -1 });

    const sanitized = comments.map((c) => {
      const comment = c.toJSON();
      if (comment.isAnonymous) comment.author = { username: 'Anonymous' };
      return comment;
    });

    res.status(200).json({ success: true, comments: sanitized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Delete a comment
// ── @route   DELETE /api/posts/comments/:id
// ── @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.isRemoved = true;
    await comment.save();

    res.status(200).json({ success: true, message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Report a post
// ── @route   POST /api/posts/:id/report
// ── @access  Private
const reportPost = async (req, res) => {
  try {
    const Report = require('../models/Report');
    const { reason, description } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reported this post
    const existing = await Report.findOne({
      reportedBy:  req.user._id,
      contentId:   post._id,
      contentType: 'post',
    });

    if (existing) {
      return res.status(400).json({ message: 'You already reported this post' });
    }

    await Report.create({
      reportedBy:  req.user._id,
      contentType: 'post',
      contentId:   post._id,
      reason,
      description: description || '',
    });

    // Increment report count on post
    post.isReported  = true;
    post.reportCount += 1;
    await post.save();

    res.status(201).json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  upvotePost,
  addComment,
  getComments,
  deleteComment,
  reportPost,
};