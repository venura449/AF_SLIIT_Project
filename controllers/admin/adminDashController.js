const{
    countTotUsers,
    countTotFeedbacks,
    countTotNeeds,
    countActiveUsers,
    getMonthlyGrowth,
    getMonthlyDonations
} = require('../../services/admin/adminDashService.js');

exports.getAdminDashStats = async (req, res) => {
    try{
        const [totalUsers, totalFeedbacks, totalNeeds, activeUsers, monthlyGrowth, monthlyDonations] = await Promise.all([
            countTotUsers(),
            countTotFeedbacks(),
            countTotNeeds(),
            countActiveUsers(),
            getMonthlyGrowth(),
            getMonthlyDonations()
        ]);

        res.status(200).json({
            totalUsers,
            totalFeedbacks,
            totalNeeds,
            activeUsers,
            monthlyGrowth,
            monthlyDonations
        });
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}
