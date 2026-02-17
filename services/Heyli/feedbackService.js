const Feedback = require( '../../models/Heyli/Feedback.js');

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

exports.putFeedback = async(id, feedback) => {
    const updatedFeedback = await Feedback.findByIdAndUpdate(id, feedback, {new: true});

    if(!updatedFeedback){
        throw new Error("Feedback not found");
    }
    return updatedFeedback;
}

exports.removeFeedback = async(id) => {
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if(!deletedFeedback){
        throw new Error("Feedback not found");
    }
    return deletedFeedback;
}