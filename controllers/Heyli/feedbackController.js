const {
    createFeedback,
    getFeedbacks,
    // getFeedbackAvgRating,
    putFeedback,
    updateRatingOnly,
    removeFeedback
} = require('../../services/Heyli/feedbackService.js'); 

exports.addFeedback = async(req,res) => {
    try{
        const {need, user, content, rating, imageUrl} = req.body;

        const savedFeedback = await createFeedback({need,user,content, rating, imageUrl});    

        if(savedFeedback){
            res.status(201).json({message: "Feedback added successfully", savedFeedback});
        }

    }catch(e){
        res.status(400).json({ error: e.message});
    }
}

exports.feedback = async(req,res) => {
    try{
        const feedbacks = await getFeedbacks();

        res.status(200).json({message: "Feedbacks fetched successfully", feedbacks});

    }catch(e){
        res.status(500).json({error: e.message});
    }
}

// exports.getAvgRating = async(req,res) => {
//     try{
//         const {needId} = req.params;

//         const avgRating = await getFeedbackAvgRating(needId);

//         res.status(200).json({message: "Average rating fetched successfully", avgRating: feedbacks});
//     }catch(e){
//         res.status(500).json({error: e.message});
//     }
// }

exports.updateFeedback = async(req,res) => {
    try{
        const {id} = req.params;
        const {need, user, content, rating, imageUrl} = req.body;

        const updatedFeedback = await putFeedback(id, {need,user,content, rating, imageUrl});

        res.status(200).json({message: "Feedback updated successfully", updatedFeedback});
    }catch(e){
        res.status(404).json({error: e.message});
    }
}

exports.updateRating = async(req,res) => {
    try{
        const {id} = req.params;
        const {rating} = req.body;

        const updatedFeedback = await updateRatingOnly(id, {rating});

        res.status(200).json({message: "Rating updated successfully", updatedFeedback});
    }catch(e){
        res.status(404).json({error: e.message});
    }
}

exports.deleteFeedback = async(req,res) => {
    try{
        const {id} = req.params;

        const deletedFeedback = await removeFeedback(id);

        res.status(200).json({message: "Feedback deleted successfully", deletedFeedback});
    }catch(e){
        res.status(404).json({error: e.message});
    }
}
