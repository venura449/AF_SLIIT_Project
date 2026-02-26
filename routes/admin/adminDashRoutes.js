const express = require('express');

const {
    getAdminDashStats,
    // getMonthlyDonations,
    // getMonthlyGrowth,
} = require('../../controllers/admin/adminDashController.js');

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get Admin Dashboard Statistics
 *     description: Retrieve dashboard statistics including total users, donations, needs, and feedbacks
 *     tags:
 *       - Admin Dashboard
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalDonations:
 *                   type: number
 *                 totalNeeds:
 *                   type: number
 *                 totalFeedbacks:
 *                   type: number
 *                 verifiedUsers:
 *                   type: number
 *                 pendingDocuments:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', getAdminDashStats);

module.exports = router;
