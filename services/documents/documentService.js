const User = require('../../models/users/User');
const path = require('path');
const fs = require('fs');

// Upload NIC Document Service
exports.uploadNicDocumentService = async (userId, file) => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update user with document info
  user.nicDocument = {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    uploadedAt: new Date(),
  };
  user.documentStatus = 'pending';

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

// Get Document Status Service
exports.getDocumentStatusService = async (userId) => {
  const user = await User.findById(userId).select('nicDocument documentStatus documentRejectionReason');
  if (!user) {
    throw new Error('User not found');
  }
  return {
    nicDocument: user.nicDocument,
    documentStatus: user.documentStatus,
    documentRejectionReason: user.documentRejectionReason,
  };
};

// Get Users with Pending Documents Service (Admin)
exports.getPendingDocumentsService = async () => {
  const users = await User.find({ 
    documentStatus: 'pending',
    'nicDocument.filename': { $exists: true }
  }).select('-password').sort({ 'nicDocument.uploadedAt': -1 });
  return users;
};

// Get All Unverified Users Service (Admin)
exports.getUnverifiedUsersService = async () => {
  const users = await User.find({ 
    documentStatus: { $in: ['not_uploaded', 'pending', 'rejected'] }
  }).select('-password').sort({ createdAt: -1 });
  return users;
};

// Verify User Document Service (Admin)
exports.verifyDocumentService = async (userId, approve, rejectionReason = '') => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.nicDocument || !user.nicDocument.filename) {
    throw new Error('User has not uploaded any document');
  }

  if (approve) {
    user.documentStatus = 'verified';
    user.isVerified = true;
    user.documentRejectionReason = '';
  } else {
    user.documentStatus = 'rejected';
    user.isVerified = false;
    user.documentRejectionReason = rejectionReason || 'Document verification failed';
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

// Get Document File Path Service (Admin)
exports.getDocumentPathService = async (userId) => {
  const user = await User.findById(userId).select('nicDocument');
  if (!user) {
    throw new Error('User not found');
  }
  if (!user.nicDocument || !user.nicDocument.path) {
    throw new Error('No document found for this user');
  }
  return user.nicDocument.path;
};
