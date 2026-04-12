const express = require("express");
const router = express.Router();

const {
  createPaymentIntentController,
  createCheckoutSessionController
} = require("../../controllers/payment/paymentController");

const { protect } = require("../../middleware/authmiddleware");
router.post("/create-payment-intent", protect, createPaymentIntentController);

module.exports = router;