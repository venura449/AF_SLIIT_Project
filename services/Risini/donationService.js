const Donation = require("../../models/Risini/Donation");

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
 
exports.confirmDonation = async (id, transactionId) => {
  const updatedDonation = await Donation.findByIdAndUpdate(
    id,
    {
      paymentStatus: "Completed",
      transactionId: transactionId || "MANUAL-" + Date.now(),
    },
    { new: true }
  );

  if (!updatedDonation) {
    throw new Error("Donation not found");
  }

  return updatedDonation;
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