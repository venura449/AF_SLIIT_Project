const {sendNotification, saveNotificationToken} = require("../../services/notifications/notificationService");

exports.saveFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId =  req.user ? req.user.id : null;

        if(!fcmToken){
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
    try{
        const {token, title, body} = req.body;

        const response = await sendNotification(token, title, body);

        res.status(200).json({message: "Notification sent successfully", response: response});
    }catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({message: "Failed to send notification", error: error.message});
    }
}