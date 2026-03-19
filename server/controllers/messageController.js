// server/controllers/messageController.js
const Message = require('../models/Message');
const User    = require('../models/User');

// ── @desc    Get conversation with a user
// ── @route   GET /api/messages/:userId
// ── @access  Private
const getConversation = async (req, res) => {
  try {
    const myId     = req.user._id;
    const otherId  = req.params.userId;
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 30;
    const skip     = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ],
      isRemoved: false,
    })
      .populate({ path: 'sender',   select: 'username avatar' })
      .populate({ path: 'receiver', select: 'username avatar' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Sanitize anonymous senders
    const sanitized = messages.map((m) => {
      const msg = m.toJSON();
      if (msg.isAnonymous && msg.sender._id?.toString() !== myId.toString()) {
        msg.sender = { username: 'Anonymous' };
      }
      return msg;
    });

    res.status(200).json({ success: true, messages: sanitized.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get inbox (latest message per conversation)
// ── @route   GET /api/messages/inbox
// ── @access  Private
const getInbox = async (req, res) => {
  try {
    const myId = req.user._id;

    // Get all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
      isRemoved: false,
    })
      .populate({ path: 'sender',   select: 'username avatar' })
      .populate({ path: 'receiver', select: 'username avatar' })
      .sort({ createdAt: -1 });

    // Group by conversation partner — keep only latest message
    const conversations = new Map();

    for (const msg of messages) {
      const otherId =
        msg.sender._id.toString() === myId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversations.has(otherId)) {
        conversations.set(otherId, msg);
      }
    }

    const inbox = Array.from(conversations.values()).map((m) => {
      const msg = m.toJSON();
      if (msg.isAnonymous && msg.sender._id?.toString() !== myId.toString()) {
        msg.sender = { username: 'Anonymous' };
      }
      return msg;
    });

    res.status(200).json({ success: true, inbox });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Send a message via REST (fallback)
// ── @route   POST /api/messages/:userId
// ── @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

    const receiver = await User.findById(req.params.userId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = await Message.create({
      sender:      req.user._id,
      receiver:    req.params.userId,
      content,
      isAnonymous: isAnonymous || false,
    });

    await message.populate({ path: 'sender', select: 'username avatar' });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Mark message as read
// ── @route   PUT /api/messages/:id/read
// ── @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Get unread message count
// ── @route   GET /api/messages/unread/count
// ── @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead:   false,
      isRemoved: false,
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversation,
  getInbox,
  sendMessage,
  markAsRead,
  getUnreadCount,
};