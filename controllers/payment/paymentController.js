const { createPaymentIntent, createCheckoutSession } = require("../../services/payment/paymentService");

exports.createPaymentIntentController = async (req, res, next) => {
  try {
    const { amount, donationId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!donationId) {
      return res.status(400).json({ message: "Need ID is required" });
    }

    const paymentIntent = await createPaymentIntent(amount, donationId);

    res.status(200).json(paymentIntent);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCheckoutSessionController = async (req, res, next) => {
  try {
    const { amount, donationId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!donationId) {
      return res.status(400).json({ message: "Donation ID is required" });
    }

    const session = await createCheckoutSession({
      amount,
      donationId
    });

    res.status(200).json({
      id: session.id,
      url: session.url
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};