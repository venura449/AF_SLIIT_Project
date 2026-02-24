const express = require('express');

const auth = require('../../middleware/authMiddleware.js');
const {
    addFeedback,
    feedback,
    updateFeedback,
    deleteFeedback, 
    updateAvgRating
} = require('../../controllers/Heyli/feedbackController.js');
const {
    addReview,
    getReviews,
    updateReview,
    deleteReview
} = require('../../controllers/Heyli/reviewController.js');

const router = express.Router();

//Feedback Routers
router.post('/createFeedback',auth.protect,addFeedback);
router.get('/fetchFeedbacks',feedback);
router.put('/updateFeedback/:id',updateFeedback);
router.put('/updateAvgRating/:id', updateAvgRating);
router.delete('/deleteFeedback/:id',deleteFeedback);

//Review Routers
router.post('/:feedbackId/createReview', auth.protect ,addReview);
router.get('/fetchReviews', getReviews);
router.put('/updateReview/:id', updateReview);
router.delete('/deleteReview/:id', deleteReview);

module.exports = router;