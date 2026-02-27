const admin = require("../../utils/notificationConfig");
const User = require("../../models/users/User");

exports.saveNotificationToken = async (userId, fcmToken) => {
    try{
        if (!fcmToken || typeof fcmToken !== "string" || fcmToken.length < 50) {
            throw new Error("Invalid FCM token format");
        }
        const user = await User.findByIdAndUpdate(userId, { fcmToken: fcmToken }, { new: true });

        return user;
    } catch (error) {
        throw error;
    }
}

exports.sendNotification = async (token, title, body) => {
    try{
        const message = {
            notification: {
                title: title,
                body: body
            },
            token: token
        };
        const response = await admin.messaging().send(message);

        return response;
    } catch (error) {
        if (error.code === "messaging/registration-token-not-registered") {
            console.log("Token expired. Remove from database.");
            await User.updateOne(
                { fcmToken: token },
                { $unset: { fcmToken: "" } },
                { new: true }
            );
        }
        throw error;
    }
}
