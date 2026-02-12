const User = require('../../models/Venura/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup Service
exports.signupService = async (username, email, password) => {
  // Validate inputs
  if (!username || !email || !password) {
    throw new Error('All fields are required');
  }

  // Check if user exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const user = new User({ username, email, password });
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

// Login Service
exports.loginService = async (email, password) => {
  // Validate inputs
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};
