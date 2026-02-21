const User = require('../../models/Venura/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup Service
exports.signupService = async (username, email, password, role = 'Donor') => {
  // Validate inputs
  if (!username || !email || !password) {
    throw new Error('All fields are required');
  }

  // Validate role
  const validRoles = ['Donor', 'Recipient'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role. Must be Donor or Recipient');
  }

  // Check if user exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const user = new User({ username, email, password, role });
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
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
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

// Delete Profile Service
exports.deleteProfileService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(userId);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
};

// Get All Users Service (Admin)
exports.getAllUsersService = async () => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return users;
};

// Update User Status Service (Admin)
exports.updateUserStatusService = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.isActive = isActive;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

// Update User Service (Admin)
exports.updateUserService = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Update allowed fields
  if (updateData.username) user.username = updateData.username;
  if (updateData.email) user.email = updateData.email;
  if (updateData.role) user.role = updateData.role;
  if (typeof updateData.isVerified === 'boolean') user.isVerified = updateData.isVerified;
  if (typeof updateData.isActive === 'boolean') user.isActive = updateData.isActive;

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

// Delete User Service (Admin)
exports.deleteUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(userId);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
};
