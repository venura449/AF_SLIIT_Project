const express = require('express');

const {
    addFeedback,
    feedback,
    updateFeedback,
    deleteFeedback
} = require('../../controllers/Heyli/feedbackcontroller.js');

const router = express.Router();

//Feedback Routers
router.post('/createFeedback',addFeedback);
router.get('/fetchFeedbacks',feedback);
router.put('/updateFeedback/:id',updateFeedback);
router.delete('/deleteFeedback/:id',deleteFeedback);

module.exports = router;