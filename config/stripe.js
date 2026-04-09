const Stripe = require("stripe");
let stripe;

if (process.env.NODE_ENV === "test") {
  // Mock Stripe for tests
  stripe = {
    paymentIntents: {
      create: async () => ({
        client_secret: "test_client_secret",
        id: "pi_test_123",
      }),
    },
  };
} else {
  // Real Stripe for development/production
  stripe = new Stripe(process.env.STRIPE_SECRET);
}

module.exports = stripe;
