// server/routes/postRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  upvotePost,
  addComment,
  getComments,
  deleteComment,
  reportPost
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');
const upload = require("../middleware/upload");

// ── Post routes ──
router.get('/', getPosts); // GET /api/posts

router.post(
  '/',
  protect,
  upload.single("media"),   // 👈 allows image/video upload
  createPost
);

router.get('/:id', getPostById); // GET /api/posts/:id
router.delete('/:id', protect, deletePost);
router.put('/:id/upvote', protect, upvotePost);

// ── Comment routes ──
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.delete('/comments/:id', protect, deleteComment);

// ── Report post
router.post('/:id/report', protect, reportPost);

module.exports = router;