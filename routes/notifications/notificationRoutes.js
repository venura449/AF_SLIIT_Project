const express = require("express");
const router = express.Router();
const { sendNotificationToUser,saveFCMToken } = require("../../controllers/notification/notificationController");
const { protect } = require("../../middleware/authmiddleware");

router.post("/save-fcm-token", protect, saveFCMToken);
router.post("/sendNotification", sendNotificationToUser);

module.exports = router;