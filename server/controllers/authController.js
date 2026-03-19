// server/controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ── @desc    Register new user
// ── @route   POST /api/auth/register
// ── @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Register attempt:', { username, email }); // ADD THIS

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already in use'
          : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password });

    console.log('User created:', user._id); // ADD THIS

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (error) {
    console.log('REGISTER ERROR:', error.message); // ADD THIS
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Login user
// ── @route   POST /api/auth/login
// ── @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({
        message: `Account banned: ${user.banReason || 'Contact support'}`,
      });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @desc    Logout user
// ── @route   POST /api/auth/logout
// ── @access  Public
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ── @desc    Get current logged-in user
// ── @route   GET /api/auth/me
// ── @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, logout, getMe };