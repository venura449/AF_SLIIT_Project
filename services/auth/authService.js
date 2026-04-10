const User = require('../../models/users/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');

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

  // Validate username
  if (username.length > 20) {
    throw new Error('Username cannot exceed 20 characters');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers and underscores');
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

// Update User Email Service
exports.updateEmailService = async (userId, newEmail) => {
  // Validate new email
  if (!newEmail) {
    throw new Error('Email is required');
  }

  // Check if email is valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    throw new Error('Invalid email format');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if new email is already taken by another user
  const existingUser = await User.findOne({ email: newEmail, _id: { $ne: userId } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Update email
  user.email = newEmail;
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

// Forgot Password Service
exports.forgotPasswordService = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('No account found with that email');
  }

  const resetToken = user.generateResetToken();
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0A1A2F; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4ADE80; font-size: 22px; margin: 0;">BridgeConnect</h1>
        <p style="color: #86efac; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
      </div>
      <p style="color: #d1fae5; font-size: 14px;">Hi <strong>${user.username}</strong>,</p>
      <p style="color: #bbf7d0; font-size: 14px;">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #16a34a, #10b981); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #86efac; font-size: 12px;">This link expires in <strong>15 minutes</strong>.</p>
      <p style="color: #86efac; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #1e3a4a; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 11px; text-align: center;">&copy; BridgeConnect. All rights reserved.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'BridgeConnect - Password Reset',
    html,
  });

  return { message: 'Password reset link sent to your email' };
};

// Reset Password Service
exports.resetPasswordService = async (token, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successful. You can now log in.' };
};
