const User = require("../../models/Venura/User");
const admin = require("../../utils/Heyli/firebaseAdmin");

exports.saveToken = async (userId, token) => {
    const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken: token }, { new: true });

    if (!updatedUser) {
        throw new Error("User not found");
    }
    return updatedUser;
}

exports.sendNeedNotification = async (title, body) => {
    const users = await User.find({ role: "donor", fcmToken: { $ne: null } });

    const tokens = users.map(user => user.fcmToken);

    if (tokens.length === 0) {
        console.log("No users with FCM tokens found.");
        return;
    }
    
    const message = {
        notification: {
            title: title,
            body: body
        },
        tokens: tokens
    };

    return await admin.messaging().sendMulticast(message);
}