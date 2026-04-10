const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../../controllers/payment/paymentController")
const { protect } = require("../../middleware/authmiddleware");
router.post("/create-payment-intent", createPaymentIntent);

module.exports = router;