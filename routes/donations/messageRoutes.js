const express = require('express');
const { protect } = require('../../middleware/authmiddleware');
const {
    sendMessage,
    getConversation,
    getMyConversations
} = require('../../controllers/donations/messageController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a Message
 *     description: Send a message to another user regarding an item listing
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemListing
 *               - receiver
 *               - content
 *             properties:
 *               itemListing:
 *                 type: string
 *                 description: ID of the related item listing
 *               receiver:
 *                 type: string
 *                 description: ID of the receiving user
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
// Send a message
router.post('/', protect, sendMessage);

/**
 * @swagger
 * /api/v1/messages/item/{itemId}:
 *   get:
 *     summary: Get Conversation for an Item
 *     description: Retrieve all messages between the current user and the other party for a specific item listing
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item listing ID
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
// Get all messages for a specific item between current user and the other party
router.get('/item/:itemId', protect, getConversation);

/**
 * @swagger
 * /api/v1/messages/my-conversations:
 *   get:
 *     summary: Get My Conversations
 *     description: Retrieve all conversations for the currently authenticated user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
// Get all conversations for current user
router.get('/my-conversations', protect, getMyConversations);

module.exports = router;
