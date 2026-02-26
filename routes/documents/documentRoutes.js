const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadNicDocument,
  getDocumentStatus,
  getPendingDocuments,
  getUnverifiedUsers,
  verifyDocument,
  getUserDocument,
} = require("../../controllers/documents/documentController");
const { protect, authorize } = require("../../middleware/authmiddleware");

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads/nic_documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const uniqueSuffix = `${req.user._id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and PDF files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * @swagger
 * /api/v1/documents/upload:
 *   post:
 *     summary: Upload NIC Document
 *     description: Upload NIC (National Identity Card) document for verification
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nicDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid file type or size exceeds 5MB
 */
router.post(
  "/upload",
  protect,
  upload.single("nicDocument"),
  uploadNicDocument,
);

/**
 * @swagger
 * /api/v1/documents/status:
 *   get:
 *     summary: Get Document Verification Status
 *     description: Check the verification status of your uploaded documents
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/status", protect, getDocumentStatus);

/**
 * @swagger
 * /api/v1/documents/admin/pending:
 *   get:
 *     summary: Get Pending Documents
 *     description: Retrieve list of pending document verifications (Admin only)
 *     tags:
 *       - Documents Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/admin/pending", protect, authorize("Admin"), getPendingDocuments);

/**
 * @swagger
 * /api/v1/documents/admin/unverified:
 *   get:
 *     summary: Get Unverified Users
 *     description: Retrieve list of users with unverified documents (Admin only)
 *     tags:
 *       - Documents Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unverified users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/admin/unverified",
  protect,
  authorize("Admin"),
  getUnverifiedUsers,
);

/**
 * @swagger
 * /api/v1/documents/admin/verify/{userId}:
 *   put:
 *     summary: Verify User Document
 *     description: Verify a user's document and mark them as verified (Admin only)
 *     tags:
 *       - Documents Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Document verified successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  "/admin/verify/:userId",
  protect,
  authorize("Admin"),
  verifyDocument,
);

/**
 * @swagger
 * /api/v1/documents/admin/document/{userId}:
 *   get:
 *     summary: Get User Document
 *     description: Retrieve a user's uploaded document for viewing
 *     tags:
 *       - Documents Admin
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *       404:
 *         description: Document not found
 */
router.get("/admin/document/:userId", getUserDocument);

module.exports = router;
