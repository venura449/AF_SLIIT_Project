
const express = require("express");
const router = express.Router();

const donationController = require("../../controllers/donations/donationController");
const { protect, authorize } = require("../../middleware/authmiddleware");
/*
Contains core business logic.
 Responsible for:
 - Database operations
 - Updating related models
 - Maintaining data consistency
 
 This keeps controllers clean and improves maintainability.
 */


/**
 * @swagger
 * /api/v1/donation:
 *   post:
 *     summary: Create Donation
 *     description: Create a new donation to a need (Donor only)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - needId
 *               - amount
 *             properties:
 *               needId:
 *                 type: string
 *                 description: ID of the need to donate to
 *               amount:
 *                 type: number
 *                 description: Amount to donate
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Donor role required
 */
// Create Donation by Donor
router.post(
  "/",
  protect,
  authorize("Donor"),
  donationController.createDonation
);

/**
 * @swagger
 * /api/v1/donation/{id}/confirm:
 *   patch:
 *     summary: Confirm Donation
 *     description: Confirm a pending donation (Admin only)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Donation not found
 */
// Confirm Donation by Admin only
router.patch(
  "/:id/confirm",
  protect,
  authorize("Admin"),
  donationController.confirmDonation
);

/**
 * @swagger
 * /api/v1/donation/my:
 *   get:
 *     summary: Get My Donations
 *     description: Retrieve all donations made by the authenticated donor
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of donor's donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Donor role required
 */
// Get My Donations by Only Donor (logged-in user)
router.get(
  "/my",
  protect,
  authorize("Donor"),
  donationController.getMyDonations
);

/**
 * @swagger
 * /api/v1/donation:
 *   get:
 *     summary: Get All Donations
 *     description: Retrieve all donations in the system (Admin only)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// Get All Donations by Admin Only
router.get(
  "/",
  protect,
  authorize("Admin"),
  donationController.getAllDonations
);

/**
 * @swagger
 * /api/v1/donation/{id}:
 *   get:
 *     summary: Get Donation By ID
 *     description: Retrieve a specific donation by its ID
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Donation not found
 */
// Get Donation By ID (Protected)
router.get(
  "/:id",
  protect,
  donationController.getDonationById
);

/**
 * @swagger
 * /api/v1/donation/{id}:
 *   delete:
 *     summary: Delete Donation
 *     description: Delete a donation (Admin only)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Donation not found
 */
// Delete a Donation (Admin Only)
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  donationController.deleteDonation
);
module.exports = router;