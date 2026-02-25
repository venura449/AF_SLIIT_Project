const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    need: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Need' 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }, 
    content: { 
        type: String, 
        required: true
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 5
    },
    imageUrl: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
