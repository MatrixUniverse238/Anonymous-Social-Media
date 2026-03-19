// server/routes/adminRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getAllUsers,
  getUserById,
  banUser,
  changeUserRole,
  getAllPosts,
  removePost,
  getReports,
  updateReport,
  getStats,
} = require('../controllers/adminController');
const { protect }        = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All admin routes require login + admin role
router.use(protect);
router.use(authorizeRoles('admin', 'moderator'));

// ── Stats ──
router.get('/stats', authorizeRoles('admin'), getStats);

// ── User management ──
router.get('/users',          authorizeRoles('admin'), getAllUsers);
router.get('/users/:id',      authorizeRoles('admin'), getUserById);
router.put('/users/:id/ban',  authorizeRoles('admin'), banUser);
router.put('/users/:id/role', authorizeRoles('admin'), changeUserRole);

// ── Post moderation (admin + moderator) ──
router.get('/posts',       getAllPosts);
router.delete('/posts/:id', removePost);

// ── Reports ──
router.get('/reports',      getReports);
router.put('/reports/:id',  authorizeRoles('admin'), updateReport);

module.exports = router;