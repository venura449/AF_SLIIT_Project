const express = require('express');
const router = express.Router();
const needController = require('../../controllers/Lochana/needController');

router.post('/needs')
    .get(needController.getAllNeeds)
    .post(needController.createNeed);

module.exports = router;