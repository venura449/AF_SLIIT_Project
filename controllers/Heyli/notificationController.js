const {saveToken} = require("../../services/Heyli/notificationService");

exports.saveFcmToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id; 

        const result = await saveToken(userId, token);

        res.status(200).json({ message: "FCM token saved successfully", result });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        res.status(500).json({ message: "Failed to save FCM token" });
    }
};
