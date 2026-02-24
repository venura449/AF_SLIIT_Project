const express = require('express');
const {
  signup,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} = require('../../controllers/auth/authController');
const { protect } = require('../../middleware/authmiddleware');

const router = express.Router();

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);

module.exports = router;
