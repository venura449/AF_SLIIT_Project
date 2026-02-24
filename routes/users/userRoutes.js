const express = require("express");
const {
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
} = require("../../controllers/auth/authController");
const { protect, authorize } = require("../../middleware/authmiddleware");

const router = express.Router();

//User Management Routes (Admin)
router.get("/", protect, authorize("Admin"), getAllUsers);
router.put("/:userId/status", protect, authorize("Admin"), updateUserStatus);
router.put("/:userId", protect, authorize("Admin"), updateUser);
router.delete("/:userId", protect, authorize("Admin"), deleteUser);

module.exports = router;
