const User = require('../../models/Venura/User.js');
const admin = require('../../utils/Heyli/firebaseAdmin.js');

exports.updateFCMToken = async (userId, token) => {
    const user =  await User.findByIdAndUpdate(userId, { fcmToken: token }, { new: true });
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
}

const notifyDonors = async (donorIds, title) => {
    const message = {
        notification: {
            title: 'New Need Request',
            body: `A new need request has been posted for ${title}`,
        },
        tokens: donorIds,
    };

    await admin.messaging().sendMulticast(message);
}

const notifyFeedback = async (donorId, title) => {
    const message = {
        notification: {
            title: 'New Feedback',
            body: `You have received feedback for the need request "${title}"`,
        },
        token: donorId,
    };

    await admin.messaging().send(message);
}