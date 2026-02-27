
/*
  _Controller_
   Handles HTTP requests related to donation operations.

  Responsible for:
   - Validating request data
   - Checking business rules
   - Calling service layer
   - Sending proper HTTP responses
 
    Business logic is delegated to service layer for clean architecture.
 */
const donationService = require('../../services/donations/donationService');
const Need = require('../../models/donations/Need');

/*
 Handles HTTP requests related to donation operations.
 Responsible for:
 - Validating request data
 - Checking business rules
 - Calling service layer
 - Sending proper HTTP responses

 Business logic is delegated to service layer for clean architecture.
 */

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
    // Must be verified
    if (!existingNeed.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Cannot donate to unverified need",
      });
    }

    // Cannot donate if cancelled or fulfilled
    if (
      existingNeed.status === "Cancelled" ||
      existingNeed.status === "Fulfilled"
    ) {
      return res.status(400).json({
        success: false,
        message: "This need is no longer accepting donations",
      });
    }

    // Check Remaining Amount
    if (Number(amount) > existingNeed.goalAmount) {
      return res.status(400).json({
        success: false,
        message: `Only ${existingNeed.goalAmount} amount remaining`,
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
   
    // Increase collected amount
    existingNeed.currentAmount =
      Number(existingNeed.currentAmount) + Number(amount);
    // Reduce remaining goal
    existingNeed.goalAmount =
      Number(existingNeed.goalAmount) - Number(amount);

     // Update Status
    if (existingNeed.goalAmount <= 0) {
      existingNeed.goalAmount = 0;
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

     if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

     // Find Donation
    const donation = await donationService.getDonationById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }
    // Prevent double confirmation
    if (donation.status === "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Donation already confirmed",
      });
    }

    // Update Donation
    const updatedDonation = await donationService.confirmDonation(
      donationId,
      transactionId
    );

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


// Get All Donations (Admin)
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
// Delete Donation (Admin Only)
exports.deleteDonation = async (req, res, next) => {
  try {
    const donationId = req.params.id;

    // Service handles both deleting donation AND updating Need
    const deletedDonation = await donationService.deleteDonation(donationId);

    res.status(200).json({
      success: true,
      message: "Donation deleted and need updated successfully",
      data: deletedDonation,
    });

  } catch (error) {
    next(error);
  }
};