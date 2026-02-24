const express = require("express");
const router = express.Router();

const donationController = require("../../controllers/Risini/donationController");

/**
 * Create Donation
 * POST /api/v1/donation
 */
router.post("/", donationController.createDonation);

/**
 * Confirm Donation
 * PUT /api/v1/donation/:id/confirm
 */
router.put("/:id/confirm", donationController.confirmDonation);

/**
 * Get All Donations (for testing)
 * GET /api/v1/donation
 */
router.get("/", donationController.getMyDonations);

/**
 * Get Donation By ID
 * GET /api/v1/donation/:id
 */
router.get("/:id", donationController.getDonationById);

module.exports = router;