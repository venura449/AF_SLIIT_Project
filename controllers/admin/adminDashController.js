const {
    countTotUsers,
    countTotFeedbacks,
    countTotNeeds,
    countActiveUsers,
    getMonthlyGrowth,
    getMonthlyDonations,
    fetchWeather
} = require('../../services/admin/adminDashService.js');

exports.getAdminDashStats = async (req, res) => {
    try {
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
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}

exports.getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        const data = await fetchWeather(lat, lon);
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
