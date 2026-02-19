const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../../utils/Lochana/cloudinaryConfig.js');
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        console.log("Multer is processing file:", file.originalname);
        cb(null, true);
    }
});
const needController = require('../../controllers/Lochana/needController.js');
const { protect, authorize } = require('../../middleware/authmiddleware.js');

// router.route('/')
//     .get(needController.getAllNeeds)
//     .post(needController.createNeed);

router.get('/getall', needController.getAllNeeds);



//protected routes
router.patch('/update/:needId', protect, needController.updateNeedsProgress);
router.patch('/upload-verification/:needId', protect, upload.array('docs', 3), needController.uploadDocs);
router.post('/create' , protect, needController.createNeed);


router.patch('/approve/:needId', protect, authorize('Donor'), needController.verfyNeedRequest);


module.exports = router;

