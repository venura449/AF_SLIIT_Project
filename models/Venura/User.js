const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
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
    phone: String,
    address: String,
    bio: String,
    verificationDocs: [String], // URLs to files/images
  },
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

module.exports = mongoose.model('User', userSchema);
