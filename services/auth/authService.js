const User = require('../../models/users/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');
const admin = require('../../utils/notificationConfig');

// Generate JWT Token
// If rememberMe is true, token expires in 30 days; otherwise 7 days
const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
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
exports.loginService = async (email, password, rememberMe = false) => {
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

  // Generate token with rememberMe flag
  const token = generateToken(user._id, rememberMe);

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

// Google Login Service
exports.googleLoginService = async (idToken) => {
  // Validate token
  if (!idToken) {
    throw new Error('ID token is required');
  }

  try {
    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { email, name } = decodedToken;

    if (!email) {
      throw new Error('Email not found in token');
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      const username = email.split('@')[0] + '_' + Date.now().toString().slice(-6);

      user = new User({
        username,
        email,
        password: crypto.randomBytes(32).toString('hex'), // Random password since they're using OAuth
        role: 'Donor', // Default role for Google sign-up
        isVerified: true, // Google-verified emails are trusted
        profile: {
          fullName: name || '',
        },
      });

      await user.save();
    }

    // Generate JWT token (always remember for OAuth users)
    const token = generateToken(user._id, true);

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
  } catch (error) {
    if (error.code === 'auth/invalid-id-token') {
      throw new Error('Invalid ID token');
    }
    if (error.code === 'auth/id-token-expired') {
      throw new Error('ID token has expired');
    }
    throw error;
  }
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

  const clientUrl = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_FRONTEND_URL : (process.env.CLIENT_URL || 'http://localhost:5173');
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

// Google OAuth Service
exports.getGoogleAuthUrl = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_BACKEND_REDIRECT_URI : (process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5001/api/v1/auth/google-callback');
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  const state = crypto.randomBytes(32).toString('hex');

  // Store state in session or cache (in production, use Redis)
  // For now, we'll include it in the redirect

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    state: state,
  });

  return {
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    state: state,
  };
};

// Handle Google Callback
exports.handleGoogleCallback = async (code, state) => {
  if (!code) {
    throw new Error('No authorization code provided');
  }

  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_BACKEND_REDIRECT_URI : (process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5001/api/v1/auth/google-callback');

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userInfoResponse.json();

    // Find or create user
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      const username = userInfo.email.split('@')[0] + '_' + Date.now().toString().slice(-6);

      user = new User({
        username,
        email: userInfo.email,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'Donor',
        isVerified: true,
        profile: {
          fullName: userInfo.name || '',
        },
      });

      await user.save();
    }

    // Generate JWT token
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
  } catch (error) {
    throw new Error(`Google OAuth error: ${error.message}`);
  }
};
