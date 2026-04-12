// donationService.js
const Donation = require("../../models/donations/Donation");
const Need = require('../../models/donations/Need');

// Create Donation
exports.createDonation = async ({
  donor,
  need,
  amount,
  donationType,
  goodsDescription,
  phoneNumber,
  message
}) => {
  if (!donor || !need || !donationType) {
    throw new Error("Donor, Need and Donation Type are required");
  }

  if (
    (donationType === 'Cash' || donationType === 'Card') &&
    (!amount || amount <= 0)
  ) {
    throw new Error("Amount must be greater than 0 for Cash/Card donations");
  }

  const donation = new Donation({
    donor,
    need,
    amount: donationType === 'Goods' ? 0 : amount,
    donationType,
    goodsDescription,
    phoneNumber,
    message,
    paymentStatus: "Pending",
    status: "Pending" // ✅ added
  });

  await donation.save();
  return donation;
};


// Confirm Donation (Stripe/Admin)
exports.confirmDonation = async (donationId, transactionId) => {
  if (!transactionId) {
    throw new Error("Transaction ID is required !");
  }

  const donation = await Donation.findById(donationId);

  if (!donation) {
    throw new Error("Donation not found");
  }

  donation.status = "Confirmed";
  donation.transactionId = transactionId;
  donation.paymentStatus = "Completed";

  return await donation.save();
};


// Get Donations By Logged-in User
exports.getDonationsByUser = async (userId) => {
  const donations = await Donation.find({ donor: userId })
    .populate("donor", "username email")
    .populate("need", "title category");

  return donations; // ✅ fixed (was unreachable before)
};


// Get All Donations (Admin)
exports.getAllDonations = async () => {
  return await Donation.find()
    .populate("donor", "name email")
    .populate("need", "title category");
};


// Get Donation By ID
exports.getDonationById = async (id) => {
  const donation = await Donation.findById(id)
    .populate("donor", "name email")
    .populate("need", "title category");

  if (!donation) {
    throw new Error("Donation not found");
  }

  return donation;
};


// Get Donations by Need ID
exports.getDonationsByNeed = async (needId) => {
  return await Donation.find({ need: needId })
    .populate("donor", "username email")
    .sort({ createdAt: -1 });
};


// Get Fulfilled Needs (Admin log)
exports.getFulfilledNeeds = async () => {
  return await Need.find({ status: "Fulfilled", isVerified: true })
    .populate("recipient", "username email")
    .sort({ updatedAt: -1 });
};


// Delete Donation (IMPORTANT: matches your new controller logic)
exports.deleteDonation = async (donationId) => {
  const donation = await Donation.findById(donationId);

  if (!donation) throw new Error("Donation not found");

  const need = await Need.findById(donation.need);

  if (need) {
    // ✅ Reverse values (aligned with NEW logic)
    need.currentAmount =
      Number(need.currentAmount) - Number(donation.amount);

    need.goalAmount =
      Number(need.goalAmount) + Number(donation.amount);

    // Prevent negatives
    if (need.currentAmount < 0) need.currentAmount = 0;

    // ✅ Status logic (fixed)
    if (need.currentAmount === 0) {
      need.status = "Pending";
    } else if (need.goalAmount === 0) {
      need.status = "Fulfilled";
    } else {
      need.status = "Partially Funded";
    }

    await need.save();
  }

  await donation.deleteOne();

  return donation;
};