const donationService = require("../../services/donations/donationService");

// Create Donation
exports.createDonation = async (req, res, next) => {
  try {
    const { need, amount, isAnonymous } = req.body;

    const donation = await donationService.createDonation({
      donor: req.user._id, // 🔥 SECURE
      need,
      amount,
      isAnonymous,
    });

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm Donation
exports.confirmDonation = async (req, res, next) => {
  try {
    const donationId = req.params.id;
    const { transactionId } = req.body;

    const updatedDonation =
      await donationService.confirmDonation(donationId, transactionId);

    res.status(200).json({
      success: true,
      message: "Donation confirmed successfully",
      data: updatedDonation,
    });
  } catch (error) {
    next(error);
  }
};


// Get Logged-in User Donations
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await donationService.getDonationsByUser(
      req.user._id
    );

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Donations (Admin and donor)

exports.getAllDonations = async (req, res, next) => {
  try {
    const donations = await donationService.getAllDonations();

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

//Get Donation By ID

exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};
