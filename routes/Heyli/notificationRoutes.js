const express = require('express');

const {
    saveToken
} = require('../../services/Heyli/notificationController.js');

const router = express.Router();

// Notification Router
router.post('/save-token', saveToken);