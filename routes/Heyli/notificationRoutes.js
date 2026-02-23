const express = require('express');
const router = express.Router();
const { saveFcmToken } = require("../../controllers/Heyli/notificationController");
const authMiddleware = require("../../middleware/authmiddleware");

router.post("/save-token", authMiddleware.protect, saveFcmToken);

module.exports = router;