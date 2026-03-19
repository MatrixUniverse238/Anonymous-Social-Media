// server/controllers/adminController.js
const User    = require('../models/User');
const Post    = require('../models/Post');
const Comment = require('../models/Comment');
const Report  = require('../models/Report');

// ── @desc    Get all users
// ── @route   GET /api/admin/users
// ── @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const search = req.query.search;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get single user profile
// ── @route   GET /api/admin/users/:id
// ── @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get their post count
    const postCount = await Post.countDocuments({ author: user._id });

    res.status(200).json({ success: true, user, postCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Ban or unban a user
// ── @route   PUT /api/admin/users/:id/ban
// ── @access  Admin
const banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent banning another admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban an admin' });
    }

    // Toggle ban
    user.isBanned   = !user.isBanned;
    user.banReason  = user.isBanned ? (reason || 'Violated community guidelines') : null;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'User banned' : 'User unbanned',
      user: {
        id:        user._id,
        username:  user.username,
        isBanned:  user.isBanned,
        banReason: user.banReason,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Change user role
// ── @route   PUT /api/admin/users/:id/role
// ── @access  Admin
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get all posts including removed
// ── @route   GET /api/admin/posts
// ── @access  Admin + Moderator
const getAllPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.removed === 'true') filter.isRemoved = true;
    if (req.query.reported === 'true') filter.isReported = true;

    const posts = await Post.find(filter)
      .populate({ path: 'author', select: 'username email role' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({ success: true, count: posts.length, total, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Force remove any post
// ── @route   DELETE /api/admin/posts/:id
// ── @access  Admin + Moderator
const removePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isRemoved = true;
    await post.save();

    res.status(200).json({ success: true, message: 'Post removed by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get all reports
// ── @route   GET /api/admin/reports
// ── @access  Admin + Moderator
const getReports = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const status = req.query.status || 'pending';

    const reports = await Report.find({ status })
      .populate({ path: 'reportedBy', select: 'username' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ status });

    res.status(200).json({ success: true, count: reports.length, total, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Update report status
// ── @route   PUT /api/admin/reports/:id
// ── @access  Admin + Moderator
const updateReport = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get dashboard stats
// ── @route   GET /api/admin/stats
// ── @access  Admin
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      bannedUsers,
      totalPosts,
      removedPosts,
      totalComments,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments(),
      Post.countDocuments({ isRemoved: true }),
      Comment.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        bannedUsers,
        totalPosts,
        removedPosts,
        totalComments,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  banUser,
  changeUserRole,
  getAllPosts,
  removePost,
  getReports,
  updateReport,
  getStats,
};