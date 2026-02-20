const{
    countTotUsers,
    countTotFeedbacks,
    countTotNeeds,
} = require('../../services/Heyli/adminDashService.js');

exports.getAdminDashStats = async (req, res) => {
    try{
        const [totalUsers, totalFeedbacks, totalNeeds] = await Promise.all([
            countTotUsers(),
            countTotFeedbacks(),
            countTotNeeds()
        ]);

        res.status(200).json({
            totalUsers,
            totalFeedbacks,
            totalNeeds
        });
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}
