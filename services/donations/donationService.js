//donationService.js 
const Donation = require("../../models/donations/Donation");
const Need = require('../../models/donations/Need');
// Create Donation
exports.createDonation = async ({ donor, need, amount }) => {
  if (!donor || !need || !amount) {
    throw new Error("Donor, Need and Amount are required");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const donation = new Donation({
    donor,
    need,
    amount,
    paymentStatus: "Pending",
  });

  await donation.save();
  return donation;
};

//Confirm Donation
 
exports.confirmDonation = async (donationId, transactionId) => {
   const donation = await Donation.findById(donationId);

  if (!donation) {
    throw new Error("Donation not found");
  }

  donation.status = "Confirmed";
  donation.transactionId = transactionId;

  return await donation.save();
};

//Get Donations By Logged-in User
exports.getDonationsByUser = async (userId) => {
  return await Donation.find({ donor: userId })
    .populate("donor", "username email")
    .populate("need", "title category");

  return donations;
};

// Get All Donations (Admin)
exports.getAllDonations = async () => {
  return await Donation.find()
    .populate("donor", "name email")
    .populate("need", "title category");
};

//Get Donation By ID

exports.getDonationById = async (id) => {
  const donation = await Donation.findById(id)
    .populate("donor", "name email")
    .populate("need", "title category");

  if (!donation) {
    throw new Error("Donation not found");
  }

  return donation;
};

// Delete Donation 
exports.deleteDonation = async (donationId) => {
  const donation = await Donation.findById(donationId);

  if (!donation) throw new Error("Donation not found");

  const need = await Need.findById(donation.need);
  if (need) {
    // Reverse values
    need.currentAmount = Number(need.currentAmount) - Number(donation.amount);
    need.goalAmount = Number(need.goalAmount) + Number(donation.amount);

    // Prevent negative values
    if (need.currentAmount < 0) need.currentAmount = 0;

    // Update status
    if (need.currentAmount === 0) {
      need.status = "Pending";
    } else if (need.goalAmount === 0) {
      need.status = "Fulfilled";
    } else {
      need.status = "Partially Funded";
    }

    await need.save();
  }

  // Delete the donation
  await donation.deleteOne();

  return donation;
};