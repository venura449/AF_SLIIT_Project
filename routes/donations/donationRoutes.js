const express = require("express");
const router = express.Router();

const donationController = require("../../controllers/donations/donationController");
const { protect, authorize } = require("../../middleware/authmiddleware");

// Create Donation by Donor
router.post(
  "/",
  protect,
  authorize("Donor"),
  donationController.createDonation
);

// Confirm Donation by Donor or Admin
router.put(
  "/:id/confirm",
  protect,
  authorize("Donor", "Admin"),
  donationController.confirmDonation
);

// Get My Donations by Only Donor (logged-in user)
router.get(
  "/my",
  protect,
  authorize("Donor"),
  donationController.getMyDonations
);

// Get All Donations by Admin Only  (for now Donor too)
router.get(
  "/",
  protect,
  authorize("Admin", "Donor"),
  donationController.getAllDonations
);

// Get Donation By ID (Protected)
router.get(
  "/:id",
  protect,
  donationController.getDonationById
);
module.exports = router;
