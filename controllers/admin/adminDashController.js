const{
    countTotUsers,
    countTotFeedbacks,
    countTotNeeds,
    countActiveUsers,
    getMonthlyGrowth
} = require('../../services/admin/adminDashService.js');

exports.getAdminDashStats = async (req, res) => {
    try{
        const [totalUsers, totalFeedbacks, totalNeeds, activeUsers, monthlyGrowth] = await Promise.all([
            countTotUsers(),
            countTotFeedbacks(),
            countTotNeeds(),
            countActiveUsers(),
            getMonthlyGrowth()
        ]);

        res.status(200).json({
            totalUsers,
            totalFeedbacks,
            totalNeeds,
            activeUsers,
            monthlyGrowth
        });
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}
