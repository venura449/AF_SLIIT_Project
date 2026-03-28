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
router.post('/', protect, authorize('Donor'), upload.array('images', 5), createItem);

// Donor: get my listings
router.get('/my-items', protect, authorize('Donor'), getMyItems);

// Any authenticated user: browse all available items
router.get('/available', protect, getAllAvailableItems);

// Admin: get all item listings
router.get('/all', protect, authorize('Admin'), getAllItems);

// Any authenticated user: get single item
router.get('/:id', protect, getItemById);

// Donor: update own listing
router.put('/:id', protect, authorize('Donor'), updateItem);

// Donor: delete own listing
router.delete('/:id', protect, authorize('Donor'), deleteItem);

module.exports = router;
