const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    feedback: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        validate: {
            validator: Number.isFinite,
            message: 'Rating must be a valid number'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
