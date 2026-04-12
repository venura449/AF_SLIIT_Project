const express = require("express");
const router = express.Router();

const {
  createCheckoutSessionController
} = require("../../controllers/payment/paymentController");

const { protect } = require("../../middleware/authmiddleware");
router.post("/create-payment-intent",protect,createCheckoutSessionController);

module.exports = router;