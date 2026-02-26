const express = require("express");
const router = express.Router();

const donationController = require("../../controllers/donations/donationController");
const { protect, authorize } = require("../../middleware/authmiddleware");

/**
 * @swagger
 * /api/v1/donation:
 *   post:
 *     summary: Create a Donation
 *     description: Create a new donation for a specific need (Donor only)
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
 *               amount:
 *                 type: number
 *               message:
 *                 type: string
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
router.post(
  "/",
  protect,
  authorize("Donor"),
  donationController.createDonation
);

/**
 * @swagger
 * /api/v1/donation/{id}/confirm:
 *   put:
 *     summary: Confirm Donation
 *     description: Confirm a donation (Donor or Admin)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Donation confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id/confirm",
  protect,
  authorize("Donor", "Admin"),
  donationController.confirmDonation
);

/**
 * @swagger
 * /api/v1/donation/my:
 *   get:
 *     summary: Get My Donations
 *     description: Get all donations made by the logged-in donor
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 */
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
 *     description: Get all donations (Admin or Donor)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("Admin", "Donor"),
  donationController.getAllDonations
);

/**
 * @swagger
 * /api/v1/donation/{id}:
 *   get:
 *     summary: Get Donation by ID
 *     description: Get a specific donation by its ID
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
router.get(
  "/:id",
  protect,
  donationController.getDonationById
);

module.exports = router;
