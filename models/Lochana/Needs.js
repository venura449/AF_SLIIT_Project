const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Food', 'Education', 'Medical', 'Other'], 
    required: true 
  },
  urgency: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  location: { type: String, required: true },
  goalAmount: { type: Number, required: true }, // For financial needs
  currentAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Partially Funded', 'Fulfilled', 'Cancelled'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },

  isVerified:{
    type:Boolean,
    default:false
  },
  verificationDocs:[{
    url:String,
    public_id:String
  }],
  verifiedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Virtual for Pagination/Filtering logic can be added in the controller
module.exports = mongoose.model('Need', needSchema);