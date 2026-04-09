const stripe = require("../../config/stripe");

exports.createPaymentIntentService = async (amount) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
  });

  return paymentIntent;
};