const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT – includes role in payload
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(`Registration attempt: ${email} with role: ${role || 'customer'}`);

  const userExists = await User.findOne({ email });

  if (userExists) {
    console.log(`Registration failed: User ${email} already exists`);
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer', // default to customer if not provided
    isAdmin: false,           // regular users are not admin
  });

  if (user) {
    console.log(`Registration successful: ${email}`);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      token: generateToken(user._id, user.role),
    });
  } else {
    console.log(`Registration failed: Invalid user data for ${email}`);
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Hardcoded Admin Login (keep for backward compatibility)
  if (email === 'admin@gmail.com' && password === 'admin123') {
    const adminDummyId = '000000000000000000000000';
    return res.json({
      _id: adminDummyId,
      name: 'System Admin',
      email: 'admin@gmail.com',
      role: 'admin',
      isAdmin: true,
      token: generateToken(adminDummyId, 'admin'),
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    console.error('Database query failed:', error.message);
  }

  res.status(401);
  throw new Error('Invalid email or password');
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
};