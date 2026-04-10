const { saveNotificationToken,
    sendNotificationSingleUser, sendNotificationToUsers } = require("../../services/notifications/notificationService");

exports.saveFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!fcmToken) {
            return res.status(400).json({ message: "FCM token is required" });
        }

        const user = await saveNotificationToken(userId, fcmToken);

        res.status(200).json({ message: "FCM token saved successfully", user: user });
    } catch (error) {
        console.error("Error saving FCM token:", error);

        if (error.message === "Invalid FCM token format") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to save FCM token", error: error.message });
    }
}

exports.sendNotificationToUser = async (req, res) => {
    try {
        const { userId, title, body, data = {} } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                message: "userId, title and body are required",
            });
        }
        const response = await sendNotificationSingleUser(userId, title, body, data);

        res.status(200).json({ message: "Notification sent successfully", response: response });
    } catch (error) {
        console.error("Error sending notification:", error);
        if (error.message === "No FCM token found for user") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to send notification", error: error.message });
    }
}

exports.sendNotificationToMultipleUsers = async (req, res) => {
    try {
        const { userIds, title, body, data = {} } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0 || !title || !body) {
            return res.status(400).json({
                message: "userIds, title and body are required",
            });
        }
        const response = await sendNotificationToUsers(userIds, title, body, data);
        res.status(200).json({ message: "Notifications sent successfully", response: response });
    } catch (error) {
        console.error("Error sending notifications:", error);
        if (error.message === "No FCM tokens found for users") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to send notifications", error: error.message });
    }
}