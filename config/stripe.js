const Stripe = require('stripe');

const isTest = process.env.NODE_ENV === "test";

const stripe = isTest
  ? {
      paymentIntents: {
        create: async () => ({ id: "dummy_pi" })
      }
    }
  : new Stripe(process.env.STRIPE_SECRET);

module.exports = stripe;