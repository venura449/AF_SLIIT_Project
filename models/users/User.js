const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  // Role-Based Access Control
  role: {
    type: String,
    enum: ['Donor', 'Recipient', 'Admin'],
    default: 'Donor',
  },
  // Verification for Recipients (Admin controlled)
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Active status
  isActive: {
    type: Boolean,
    default: true,
  },
  // Profile Information
  profile: {
    fullName: String,
    phone: {
      type: String,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    },
    address: String,
    bio: String,
    verificationDocs: [String], // URLs to files/images
  },
  // NIC Document Upload
  nicDocument: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date,
  },
  // Document verification status
  documentStatus: {
    type: String,
    enum: ['not_uploaded', 'pending', 'verified', 'rejected'],
    default: 'not_uploaded',
  },
  fcmToken: String, // For push notifications
  documentRejectionReason: String,
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
