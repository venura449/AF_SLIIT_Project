const express = require('express');
const {
  signup,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} = require('../../controllers/Venura/authController');
const { protect, authorize } = require('../../middleware/authmiddleware');

const router = express.Router();

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);


//router.put('/verify/:userId', protect, authorize('Donor'), async (req, res)


module.exports = router;
