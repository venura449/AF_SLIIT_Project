const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../../middleware/authmiddleware');
const {
    createItem,
    getMyItems,
    getAllAvailableItems,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} = require('../../controllers/donations/itemListingController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/item_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${req.user._id}_${Date.now()}_${Math.round(Math.random() * 1E4)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Donor: create item listing with up to 5 photos
/**
 * @swagger
 * /api/v1/items:
 *   post:
 *     summary: Create Item Listing
 *     description: Donor creates a new item listing with up to 5 images
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - condition
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Electronics, Clothing, Furniture, Books, Kitchen, Toys, Sports, Other]
 *               condition:
 *                 type: string
 *                 enum: [New, Like New, Good, Fair]
 *               location:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Item listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemListing'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Donor role required
 */
router.post('/', protect, authorize('Donor'), upload.array('images', 5), createItem);

/**
 * @swagger
 * /api/v1/items/my-items:
 *   get:
 *     summary: Get My Item Listings
 *     description: Retrieve all item listings created by the authenticated donor
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemListing'
 *       401:
 *         description: Unauthorized
 */
// Donor: get my listings
router.get('/my-items', protect, authorize('Donor'), getMyItems);

/**
 * @swagger
 * /api/v1/items/available:
 *   get:
 *     summary: Get Available Items
 *     description: Browse all available item listings (authenticated users)
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemListing'
 *       401:
 *         description: Unauthorized
 */
// Any authenticated user: browse all available items
router.get('/available', protect, getAllAvailableItems);

/**
 * @swagger
 * /api/v1/items/all:
 *   get:
 *     summary: Get All Item Listings (Admin)
 *     description: Retrieve all item listings regardless of status (Admin only)
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemListing'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Admin: get all item listings
router.get('/all', protect, authorize('Admin'), getAllItems);

/**
 * @swagger
 * /api/v1/items/{id}:
 *   get:
 *     summary: Get Item By ID
 *     description: Retrieve a single item listing by its ID
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item listing ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemListing'
 *       404:
 *         description: Item not found
 */
// Any authenticated user: get single item
router.get('/:id', protect, getItemById);

/**
 * @swagger
 * /api/v1/items/{id}:
 *   put:
 *     summary: Update Item Listing
 *     description: Donor updates their own item listing
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemListing'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
// Donor: update own listing
router.put('/:id', protect, authorize('Donor'), updateItem);

/**
 * @swagger
 * /api/v1/items/{id}:
 *   delete:
 *     summary: Delete Item Listing
 *     description: Donor deletes their own item listing
 *     tags:
 *       - Item Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
// Donor: delete own listing
router.delete('/:id', protect, authorize('Donor'), deleteItem);

module.exports = router;
