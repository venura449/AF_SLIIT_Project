const mongoose = require("mongoose");

/*This schema represents a donation made by a donor to a specific need.It stores donation amount, donor reference, 
need reference,anonymity preference, and payment status.
Relationships:
   - Each donation belongs to one User (Donor)
   - Each donation belongs to one Need
Business Rules:
   - Amount must be greater than 0
   - Payment status controls confirmation flow
*/

const donationSchema = new mongoose.Schema({
  donor: {  //Who donated
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  need: { //What need they donated to
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Need', 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { //Payment result
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  transactionId: { type: String }, 

  //Indicates whether donor identity is hidden
  isAnonymous: { type: Boolean, default: false },
  //When it happened
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('Donation', donationSchema);
