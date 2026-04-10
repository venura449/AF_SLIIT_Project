const { createPaymentIntentService } = require("../../services/payment/paymentService");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await createPaymentIntentService(amount);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    if (error.message === "Invalid amount") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};