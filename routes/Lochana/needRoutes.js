const express = require('express');
const router = express.Router();
const needController = require('../../controllers/Lochana/needController.js');
const { protect, authorize } = require('../../middleware/authmiddleware.js');

// router.route('/')
//     .get(needController.getAllNeeds)
//     .post(needController.createNeed);

router.get('/getall', needController.getAllNeeds);
router.patch('/update/:needId', protect, needController.updateNeedsProgress);

router.post('/create' , protect, needController.createNeed);

module.exports = router;