const Feedback = require('../../models/Heyli/Feedback');
const User = require('../../models/Venura/User');
const Need = require('../../models/Lochana/Needs');

exports.countTotUsers = async () => {
    const totalUsers = await User.countDocuments();
    return totalUsers;
}

exports.countTotFeedbacks = async () => {
    const totalFeedbacks = await Feedback.countDocuments();

    return totalFeedbacks;
}

exports.countTotNeeds = async () => {
    const totalNeeds = await Need.countDocuments();

    return totalNeeds;
}