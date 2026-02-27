
const express = require("express");
const router = express.Router();

const donationController = require("../../controllers/donations/donationController");
const { protect, authorize } = require("../../middleware/authmiddleware");

/*
   Defines API endpoints for donation operations.
    Applies:
   - Authentication middleware (protect)
   - Role-based authorization
 
   Roles:
  - Donor → Create donation, view own donations
  - Admin → Confirm donation, delete donation
 
  */

// Create Donation by Donor
router.post(
  "/",
  protect,
  authorize("Donor"),
  donationController.createDonation
);


// Confirm Donation by Admin only
router.patch(
  "/:id/confirm",
  protect,
  authorize("Admin"),
  donationController.confirmDonation
);


// Get My Donations by Only Donor (logged-in user)
router.get(
  "/my",
  protect,
  authorize("Donor"),
  donationController.getMyDonations
);


// Get All Donations by Admin Only
router.get(
  "/",
  protect,
  authorize("Admin"),
  donationController.getAllDonations
);


// Get Donation By ID (Protected)
router.get(
  "/:id",
  protect,
  donationController.getDonationById
);


// Delete a Donation (Admin Only)
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  donationController.deleteDonation
);
module.exports = router;