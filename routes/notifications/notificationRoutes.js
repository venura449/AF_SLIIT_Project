const express = require("express");
const router = express.Router();
const { sendNotificationToUser,saveFCMToken } = require("../../controllers/notification/notificationController");
const { protect } = require("../../middleware/authmiddleware");

/**
 * @swagger
 * /api/v1/notifications/save-fcm-token:
 *   patch:
 *     summary: Save FCM Token
 *     description: Save or update Firebase Cloud Messaging token for push notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - fcmToken
 *               properties:
 *                 message:
 *                   type: string
 *                 fcmToken:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid token provided
 */
router.patch("/save-fcm-token", protect, saveFCMToken);

/**
 * @swagger
 * /api/v1/notifications/sendNotification:
 *   post:
 *     summary: Send Notification
 *     description: Send a push notification to a user or multiple users
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to send notification to
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification message body
 *               data:
 *                 type: object
 *                 description: Additional data to send with the notification
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notificationId:
 *                   type: string
 *       400:
 *         description: Invalid request or missing required fields
 *       404:
 *         description: User or FCM token not found
 *       500:
 *         description: Failed to send notification
 */
router.post("/sendNotification", sendNotificationToUser);

module.exports = router;