const { addReview, getReviews, getReview, deleteReview, updateReview } = require('../../services/Heyli/reviewService');
const { putFeedbackAvgRating } = require('../../services/Heyli/feedbackService.js');
const Review = require('../../models/Heyli/Review.js');

exports.addReview = async (req, res) => {
    try {
        const { description, rating } = req.body;

        const userId = req.user ? req.user.id : req.body.user;

        const feedbackId = req.params.feedbackId;

        const savedReview = await addReview({ feedbackId, userId, description, rating });

        if (savedReview) {
            await putFeedbackAvgRating(feedbackId);
        }

        res.status(201).json({ success: true, message: "Review added successfully", review: savedReview });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error adding review", error: error.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const reviews = await getReviews();  

        res.status(200).json({ success: true, message: "Reviews fetched successfully", reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching reviews", error: error.message });
    }
};

exports.getReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await getReview(reviewId);
        
        res.status(200).json({ success: true, message: "Review fetched successfully", review });
    } catch (error) {
        res.status(404).json({ success: false, message: "Error fetching review", error: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { description, rating } = req.body;

        const { review: updatedReview, rateChange } = await updateReview(reviewId, { description, rating });

        if(rateChange) {
            await putFeedbackAvgRating(updatedReview.feedback);
        }

        res.status(200).json({ success: true, message: "Review updated successfully", review: updatedReview });
    } catch (error) {
        res.status(404).json({ success: false, message: "Error updating review", error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;

        const deletedReview = await deleteReview(reviewId);

        if (deletedReview) {
            await putFeedbackAvgRating(deletedReview.feedback);
        }

        res.status(200).json({ success: true, message: "Review deleted successfully", review: deletedReview });
    } catch (error) {
        res.status(404).json({ success: false, message: "Error deleting review", error: error.message });
    }
};