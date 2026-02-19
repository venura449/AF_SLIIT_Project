const express = require('express');

const {
    getTotalUsers,
    getTotalFeedbacks,
    getTotalNeeds,
    // getMonthlyDonations,
    // getMonthlyGrowth,
} = require('../../controllers/Heyli/adminDashController.js');

const router = express.Router();

router.get('/total-users', getTotalUsers);
router.get('/total-feedbacks', getTotalFeedbacks);
router.get('/total-needs', getTotalNeeds);
// router.get('/monthly-donations', getMonthlyDonations);
// router.get('/monthly-growth', getMonthlyGrowth);

module.exports = router;
