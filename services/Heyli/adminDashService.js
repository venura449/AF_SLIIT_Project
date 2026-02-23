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

exports.countActiveUsers = async () => {
    const activeUsers = await User.countDocuments({ status: 'active' });

    return activeUsers;
}

// exports.getMonthlyDonations = async () => {
//     const monthlyDonations = await Donation.aggregate([
//         {
//             $group: {
//                 _id: { $month: "$createdAt" },
//                 totalAmount: { $sum: "$amount" }
//             }
//         },
//         {
//             $sort: { _id: 1 }
//         }
//     ]);

//     return monthlyDonations;
// }

exports.getMonthlyGrowth = async () => {
    const monthlyGrowth = await User.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalUsers: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    return monthlyGrowth;
}