const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../../utils/cloudinaryConfig.js');
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log("Multer is processing file:", file.originalname);
        cb(null, true);
    }
});
const needController = require('../../controllers/donations/needController.js');
const { protect, authorize } = require('../../middleware/authmiddleware.js');

/**
 * @swagger
 * /api/v1/needs/getall:
 *   get:
 *     summary: Get All Needs
 *     description: Retrieve list of all available needs
 *     tags:
 *       - Needs
 *     responses:
 *       200:
 *         description: List of needs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Need'
 */
router.get('/getall', needController.getAllNeeds);

/**
 * @swagger
 * /api/v1/needs/create:
 *   post:
 *     summary: Create a Need
 *     description: Create a new need request for financial assistance
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - targetAmount
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Need created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Need'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-needs', protect, needController.getMyNeeds);

/**
 * @swagger
 * /api/v1/needs/create:
 *   post:
 *     summary: Create a Need
 *     description: Create a new need request for financial assistance
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - targetAmount
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Need created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Need'
 *       401:
 *         description: Unauthorized
 */
router.post('/create', protect, needController.createNeed);

/**
 * @swagger
 * /api/v1/needs/update/{needId}:
 *   patch:
 *     summary: Update Need Progress
 *     description: Update the progress or status of a need
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: needId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               currentAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Need updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Need not found
 */
router.patch('/update/:needId', protect, needController.updateNeedsProgress);

/**
 * @swagger
 * /api/v1/needs/upload-verification/{needId}:
 *   patch:
 *     summary: Upload Verification Documents
 *     description: Upload documentation to verify a need request
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: needId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               docs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/upload-verification/:needId', protect, upload.array('docs', 3), needController.uploadDocs);

/**
 * @swagger
 * /api/v1/needs/approve/{needId}:
 *   patch:
 *     summary: Approve Need Request
 *     description: Approve or donate to a need request (Donor only)
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: needId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Need approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Donor role required
 */
router.patch('/approve/:needId', protect, authorize('Donor'), needController.verfyNeedRequest);

/**
 * @swagger
 * /api/v1/needs/create:
 *   post:
 *     summary: Create a Need
 *     description: Create a new need request for financial assistance
 *     tags:
 *       - Needs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - targetAmount
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Need created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Need'
 *       401:
 *         description: Unauthorized
 */
router.put('/update/:needId', protect, needController.updateNeed);

module.exports = router;
