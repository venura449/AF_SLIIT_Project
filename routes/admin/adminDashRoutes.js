const express = require('express');

const {
    getAdminDashStats,
    // getMonthlyDonations,
    // getMonthlyGrowth,
} = require('../../controllers/admin/adminDashController.js');

const router = express.Router();

router.get('/dashboard', getAdminDashStats);
// router.get('/monthly-donations', getMonthlyDonations);
// router.get('/monthly-growth', getMonthlyGrowth);

module.exports = router;
