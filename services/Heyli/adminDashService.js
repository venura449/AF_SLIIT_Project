const Feedback = require('../../models/Heyli/Feedback');
const User = require('../../models/Venura/User');
const Need = require('../../models/Lochana/Needs');

exports.countTotUsers = async () => {
    const totalUsers = await User.countDocuments();

    if(!totalUsers){
        throw new Error("No users found");
    }

    return totalUsers;
}

exports.countTotFeedbacks = async () => {
    const totalFeedbacks = await Feedback.countDocuments();

    if(!totalFeedbacks){
        throw new Error("No feedbacks found");
    }

    return totalFeedbacks;
}

exports.countTotNeeds = async () => {
    const totalNeeds = await Need.countDocuments();

    if(!totalNeeds){
        throw new Error("No needs found");
    }
    
    return totalNeeds;
}