const donationService = require('../../services/donations/donationService');
const Need = require('../../models/donations/Need');


// Create Donation
exports.createDonation = async (req, res, next) => {
  try {
    const { need, amount, isAnonymous } = req.body;

    if (!need || !amount) {
      return res.status(400).json({
        success: false,
        message: "Need ID and amount are required",
      });
    }

    // Check if Need exists
    const existingNeed = await Need.findById(need);

    if (!existingNeed) {
      return res.status(404).json({
        success: false,
        message: "Need not found",
      });
    }

    // Prevent donation to unverified need
    if (!existingNeed.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Cannot donate to unverified need",
      });
    }

    // Prevent donation if cancelled or fulfilled
    if (
      existingNeed.status === "Cancelled" ||
      existingNeed.status === "Fulfilled"
    ) {
      return res.status(400).json({
        success: false,
        message: "This need is no longer accepting donations",
      });
    }

    // Create Donation
    const donation = await donationService.createDonation({
      donor: req.user._id,
      need: existingNeed._id,
      amount,
      isAnonymous,
    });

    // Update Need progress
    existingNeed.currentAmount =
      Number(existingNeed.currentAmount) + Number(amount);

    if (existingNeed.currentAmount >= existingNeed.goalAmount) {
      existingNeed.status = "Fulfilled";
    } else {
      existingNeed.status = "Partially Funded";
    }

    await existingNeed.save();

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


// Get My Donations
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


// Get All Donations
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


// Get Donation By ID
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