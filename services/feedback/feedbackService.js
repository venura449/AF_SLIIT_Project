const Feedback = require( '../../models/feedback/Feedback.js');
const Review = require('../../models/feedback/Review.js');

exports.createFeedback = async({need, user, content, rating, imageUrl}) => {
    if(!need || !user || !content || !imageUrl){
        throw new Error("All fields are required");
    }
    
    if(rating == null){
        rating = 0;
    }

    const newFeedback = new Feedback({need, user, content, rating, imageUrl});
    await newFeedback.save();
    return newFeedback;
}

exports.getFeedbacks = async() => {
    const feedbacks = await Feedback.find();

    if(feedbacks.length === 0){
        throw new Error("No feedback found");
    }
    return feedbacks;
}

exports.putFeedbackAvgRating = async(id) => {
    if(!id){
        throw new Error("Feedback ID is required");
    }

    const reviewRatings = await Review.find({feedback: id});

    if(reviewRatings.length === 0){
        return 0;
    }

    const totalRating = reviewRatings.reduce((sum, review) => sum + review.rating, 0);

    const avgRating = totalRating / reviewRatings.length;

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, { rating: avgRating }, { new: true });

    if(!updatedFeedback){
        throw new Error("Unable to update average rating");
    }

    return updatedFeedback;
}

exports.putFeedback = async(id, feedback) => {
    if(!id){
        throw new Error("Feedback ID is required");
    }

    if(!feedback.need || !feedback.user || !feedback.content || !feedback.imageUrl){
        throw new Error("All fields are required");
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, feedback, {new: true});

    if(!updatedFeedback){
        throw new Error("Feedback not found");
    }
    return updatedFeedback;
}                                               

exports.removeFeedback = async(id) => {
    if(!id){
        throw new Error("Feedback ID is required");
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if(!deletedFeedback){
        throw new Error("Feedback not found");
    }
    return deletedFeedback;
}
