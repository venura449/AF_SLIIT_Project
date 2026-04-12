// paymentService.js
require("dotenv").config();

const Stripe = require("stripe");

let stripeInstance = null;

/**
 * Safe Stripe initializer (works in CI + production)
 */
function getStripe() {
  if (stripeInstance) return stripeInstance;

  if (process.env.NODE_ENV === "test") {
    // Dummy Stripe for CI tests
    return {
      checkout: {
        sessions: {
          create: async () => ({
            id: "test_session",
            url: "https://test-checkout"
          })
        }
      }
    };
  }

  if (!process.env.STRIPE_SECRET) {
    throw new Error("STRIPE_SECRET missing");
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET);
  return stripeInstance;
}

/**
 * Create Checkout Session
 */
exports.createCheckoutSession = async ({ amount, donationId }) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (!donationId) {
    throw new Error("Donation ID is required");
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: {
            name: "Donation Payment",
          },
          unit_amount: Math.round(amount * 100),
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

/**
 * Create Payment Intent for card payments
 */
exports.createPaymentIntent = async (amount, needId) => {
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (!needId) {
    throw new Error("Need ID is required");
  }

  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents for LKR
    currency: "lkr",
    metadata: {
      needId: needId.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};