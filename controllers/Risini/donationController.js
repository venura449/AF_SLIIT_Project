const donationService = require("../../services/Risini/donationService");

/**
 * Create Donation
 * POST /api/v1/donation
 */
exports.createDonation = async (req, res, next) => {
  try {
    const { donor, need, amount } = req.body;

      const donation = await donationService.createDonation({
      donor,
      need,
      amount
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

/**
 * Confirm Donation
 * PUT /api/v1/donation/:id/confirm
 */
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

/**
 * Get Logged-in User Donations
 * GET /api/v1/donation/my
 */
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await donationService.getDonations();
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Donation By ID
 * GET /api/v1/donation/:id
 */
exports.getDonationById = async (req, res, next) => {
  try {
    const donation =
      await donationService.getDonationById(req.params.id);

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};