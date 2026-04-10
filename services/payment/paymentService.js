// paymentService.js
require("dotenv").config();

const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET);

// Create Checkout Session
exports.createCheckoutSession = async ({ amount, donationId }) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (!donationId) {
    throw new Error("Donation ID is required");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "lkr", // ✅ Sri Lanka currency
          product_data: {
            name: "Donation Payment",
          },
          unit_amount: Math.round(amount * 100), // ✅ avoid float issues
        },
        quantity: 1,
      },
    ],

    metadata: {
      donationId: donationId.toString(), 
    },

    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  return session;
};