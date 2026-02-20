const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadNicDocument,
  getDocumentStatus,
  getPendingDocuments,
  getUnverifiedUsers,
  verifyDocument,
  getUserDocument,
} = require('../../controllers/Venura/documentController');
const { protect, authorize } = require('../../middleware/authmiddleware');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/nic_documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// User routes
router.post('/upload', protect, upload.single('nicDocument'), uploadNicDocument);
router.get('/status', protect, getDocumentStatus);

// Admin routes
router.get('/admin/pending', protect, authorize('Admin'), getPendingDocuments);
router.get('/admin/unverified', protect, authorize('Admin'), getUnverifiedUsers);
router.put('/admin/verify/:userId', protect, authorize('Admin'), verifyDocument);
// Document viewing route - handles auth internally to support img src with token query
router.get('/admin/document/:userId', getUserDocument);

module.exports = router;
