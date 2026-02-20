const express = require('express');
const {
  signup,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
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

// Admin routes
router.get('/admin/users', protect, authorize('Admin'), getAllUsers);
router.put('/admin/users/:userId/status', protect, authorize('Admin'), updateUserStatus);
router.put('/admin/users/:userId', protect, authorize('Admin'), updateUser);
router.delete('/admin/users/:userId', protect, authorize('Admin'), deleteUser);


//router.put('/verify/:userId', protect, authorize('Donor'), async (req, res)


module.exports = router;
