
const donationService = require('../../services/donations/donationService');
const Need = require('../../models/donations/Need');
const {sendNotificationSingleUser} = require("../../services/notifications/notificationService");


// Create Donation
exports.createDonation = async (req, res, next) => {
  try {
    const { need, amount, isAnonymous, donationType, goodsDescription, phoneNumber, message } = req.body;

    if (!need || !donationType) {
      return res.status(400).json({
        success: false,
        message: "Need ID and donation type are required",
      });
    }

    if ((donationType === 'Cash' || donationType === 'Card') && !amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required for Cash/Card donations",
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

    // For Cash/Card, check remaining amount
    if (donationType === 'Cash' || donationType === 'Card') {
      if (Number(amount) > existingNeed.goalAmount) {
        return res.status(400).json({
          success: false,
          message: `Only LKR ${existingNeed.goalAmount} remaining`,
        });
      }
    }

    // Create Donation
    const donation = await donationService.createDonation({
      donor: req.user._id,
      need: existingNeed._id,
      amount: donationType === 'Goods' ? 0 : Number(amount),
      donationType,
      goodsDescription: donationType === 'Goods' ? goodsDescription : undefined,
      phoneNumber: (donationType === 'Cash' || donationType === 'Card') ? phoneNumber : undefined,
      message: (donationType === 'Cash' || donationType === 'Card') ? message : undefined,
      isAnonymous,
    });

    // Update Need progress only for Cash/Card
    if (donationType === 'Cash' || donationType === 'Card') {
      existingNeed.currentAmount =
        Number(existingNeed.currentAmount) + Number(amount);
      existingNeed.goalAmount =
        Number(existingNeed.goalAmount) - Number(amount);

      if (existingNeed.goalAmount <= 0) {
        existingNeed.goalAmount = 0;
        existingNeed.status = "Fulfilled";
      } else {
        existingNeed.status = "Partially Funded";
      }

      await existingNeed.save();
    }

    try{
      // Send notification to recipient
      if(existingNeed.recipient && String(existingNeed.recipient) !== String(req.user._id)) {
        const recipientId = existingNeed.recipient;
        const donorName = req.user?.username || "A donor";
        const title = "New Donation Received";
        const body = `${donorName} donated to your need "${existingNeed.title}".`;

        await sendNotificationSingleUser(recipientId, title, body, {
          type: "need_donation",
          needId: existingNeed._id.toString(),
          donationId: donation._id.toString(),
        });
      }
    }catch (error) {
      console.error("Error sending notification:", error);
    }

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

// Get Donations by Need ID (Recipient views donations on their need)
exports.getDonationsByNeed = async (req, res, next) => {
  try {
    const donations = await donationService.getDonationsByNeed(req.params.needId);
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

// Get Fulfilled Needs (Admin log)
exports.getFulfilledNeeds = async (req, res, next) => {
  try {
    const needs = await donationService.getFulfilledNeeds();
    res.status(200).json({
      success: true,
      count: needs.length,
      data: needs,
    });
  } catch (error) {
    next(error);
  }
};