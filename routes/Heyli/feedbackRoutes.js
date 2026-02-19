const express = require('express');

const {
    addFeedback,
    feedback,
    updateFeedback,
    deleteFeedback, 
    updateRating,
    // getAvgRating
} = require('../../controllers/Heyli/feedbackController.js');

const router = express.Router();

//Feedback Routers
router.post('/createFeedback',addFeedback);
router.get('/fetchFeedbacks',feedback);
// router.get('/avgRating/:id', getAvgRating);
router.put('/updateFeedback/:id',updateFeedback);
router.put('/updateRating/:id', updateRating);
router.delete('/deleteFeedback/:id',deleteFeedback);

module.exports = router;