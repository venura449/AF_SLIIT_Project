const express = require("express");
const {
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
} = require("../../controllers/auth/authController");
const { protect, authorize } = require("../../middleware/authmiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve list of all users (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/", protect, authorize("Admin"), getAllUsers);

/**
 * @swagger
 * /api/v1/users/{userId}/status:
 *   put:
 *     summary: Update User Status
 *     description: Update user verification status (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put("/:userId/status", protect, authorize("Admin"), updateUserStatus);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     summary: Update User Information
 *     description: Update user information (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put("/:userId", protect, authorize("Admin"), updateUser);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: Delete User
 *     description: Delete a user account (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:userId", protect, authorize("Admin"), deleteUser);

module.exports = router;
