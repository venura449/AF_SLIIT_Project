const mongoose = require('mongoose');

const itemListingSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Furniture', 'Books', 'Kitchen', 'Toys', 'Sports', 'Other'],
        default: 'Other'
    },
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair'],
        default: 'Good'
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    location: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Claimed'],
        default: 'Available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ItemListing', itemListingSchema);
