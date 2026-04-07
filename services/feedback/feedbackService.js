const Feedback = require('../../models/feedback/Feedback.js');
const Review = require('../../models/feedback/Review.js');
const User = require('../../models/users/User.js');

exports.createFeedback = async ({ need, user, content, rating, imageUrl }) => {
    if (!need || !user || !content ) {
        if (!need) console.log("Missing field: need");
        if (!user) console.log("Missing field: user");
        if (!content) console.log("Missing field: content");
        throw new Error("All fields are required");
    }

    if (rating == null) {
        rating = 0;
    }

    const userDoc = await User.findById(user).select('username email role');

    if (!userDoc) {
        throw new Error("User not found");
    }

    const newFeedback = new Feedback({ need, user, content, rating, imageUrl });
    await newFeedback.save();
    return await Feedback.findById(newFeedback._id)
        .populate('user', 'username email role')
        .populate('need', 'title');
}

exports.getFeedbacks = async () => {
    return await Feedback.find({ need: { $exists: true, $ne: null } })
        .populate('user', 'username email role')
        .populate('need', 'title')
        .sort({ createdAt: -1 });
}

exports.putFeedbackAvgRating = async (id) => {
    const reviewRatings = await Review.find({ feedback: id });

    if (reviewRatings.length === 0) {
        return 0;
    }

    const totalRating = reviewRatings.reduce((sum, review) => sum + review.rating, 0);

    const avgRating = totalRating / reviewRatings.length;

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, { rating: avgRating }, { new: true });

    if (!updatedFeedback) {
        throw new Error("Feedback not found");
    }

    return updatedFeedback;
}

exports.putFeedback = async (id, feedback) => {
    const updatePayload = Object.fromEntries(
        Object.entries(feedback).filter(([, value]) => value !== undefined)
    );

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updatePayload, { new: true })
        .populate('user', 'username email role')
        .populate('need', 'title');

    if (!updatedFeedback) {
        throw new Error("Feedback not found");
    }
    return updatedFeedback;
}

exports.removeFeedback = async (id) => {
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
        throw new Error("Feedback not found");
    }

    await Review.deleteMany({ feedback: id });
    return deletedFeedback;
}

exports.submitPlatformReview = async ({ user, content, rating }) => {
    if (!user || !content) {
        throw new Error("User and content are required");
    }
    const newFeedback = new Feedback({ user, content, rating: rating || 0 });
    await newFeedback.save();
    return newFeedback;
}

exports.getPlatformReviews = async () => {
    const reviews = await Feedback.find({ need: { $exists: false } })
        .populate('user', 'username email role')
        .sort({ createdAt: -1 });
    return reviews;
}
