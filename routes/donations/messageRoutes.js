const express = require('express');
const { protect } = require('../../middleware/authmiddleware');
const {
    sendMessage,
    getConversation,
    getMyConversations
} = require('../../controllers/donations/messageController');

const router = express.Router();

// Send a message
router.post('/', protect, sendMessage);

// Get all messages for a specific item between current user and the other party
router.get('/item/:itemId', protect, getConversation);

// Get all conversations for current user
router.get('/my-conversations', protect, getMyConversations);

module.exports = router;
