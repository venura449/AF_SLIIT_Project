const admin = require("../../utils/notificationConfig");
const User = require("../../models/users/User");

const normalizeDataPayload = (data = {}) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );

exports.saveNotificationToken = async (userId, fcmToken) => {
    if (!fcmToken || typeof fcmToken !== "string" || fcmToken.length < 50) {
        throw new Error("Invalid FCM token format");
    }
    const user = await User.findByIdAndUpdate(userId, { fcmToken: fcmToken }, { new: true });

    return user;
}

exports.sendNotification = async (token, title, body, data = {}) => {
    const message = {
        notification: {
            title: title,
            body: body
        },
        data: normalizeDataPayload(data),
        token: token
    };
    const response = await admin.messaging().send(message);

    return response;
}

exports.sendNotificationSingleUser = async (userId, title, body, data = {}) => {
    const user = await User.findById(userId).select("fcmToken");

    if (!user?.fcmToken) {
        throw new Error("No FCM token found for user");
    }

    const response = await exports.sendNotification(
        user.fcmToken,
        title,
        body,
        data,
    );
    return response;
}

exports.sendNotificationToUsers = async (userIds, title, body, data = {}) => {
    const users = await User.find({ _id: { $in: userIds } }, "fcmToken");
    const tokens = users
        .map((user) => user.fcmToken)
        .filter(Boolean);

    if (!tokens || tokens.length === 0) {
        throw new Error("No FCM tokens found for users");
    }

    const message = {
        notification: {
            title: title,   
            body: body
        },
        data: normalizeDataPayload(data),
        tokens
    };
    const response = await admin.messaging().sendMulticast(message);
    
    return response;
}
