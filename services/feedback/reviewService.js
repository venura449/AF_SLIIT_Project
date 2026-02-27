const Review = require('../../models/feedback/Review.js');
const User = require('../../models/users/User.js');

exports.addReview = async ({ feedbackId, userId, description, rating }) => {
    if (!feedbackId || !userId || !description || rating === undefined) {
        throw new Error("All fields are required");
    }

    const userDoc = await User.findById(userId).select('role');

    if (!userDoc || userDoc.role !== 'Donor') {
        throw new Error("Only donors can add reviews");
    }

    const newReview = new Review({
        feedback: feedbackId,
        user: userId,
        description,
        rating
    });

    return await newReview.save();
};

exports.getReviews = async () => {
    const reviews = await Review.find().populate('user', 'name');

    return reviews;
};

exports.getReview = async (reviewId) => {
    if (!reviewId) {
        throw new Error("Review ID is required");
    }

    const review = await Review.findById(reviewId).populate('user', 'name');

    if (!review) {
        throw new Error("Review not found");
    }

    return review;
};

exports.updateReview = async (reviewId, { description, rating }) => {

    if(description === undefined && rating === undefined) {
        throw new Error("At least one field (description or rating) must be provided for update");
    }

    const existingReview = await Review.findById(reviewId);

    if (!existingReview) {
        throw new Error("Review not found");
    }

    let rateChange = false;
    
    if(existingReview.rating !== rating) {
        rateChange = true;
    }

    const review = await Review.findByIdAndUpdate(
        reviewId,
        { description, rating },
        { new: true, runValidators: true }
    );

    
    return {review,rateChange};
};

exports.deleteReview = async (reviewId) => {
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
        throw new Error("Review not found");
    }

    return review;
};
