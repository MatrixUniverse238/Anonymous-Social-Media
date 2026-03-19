// server/routes/messageRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getConversation,
  getInbox,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all message routes require auth

router.get('/inbox',          getInbox);
router.get('/unread/count',   getUnreadCount);
router.get('/:userId',        getConversation);
router.post('/:userId',       sendMessage);
router.put('/:id/read',       markAsRead);

module.exports = router;