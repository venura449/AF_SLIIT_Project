const Stripe = require("stripe");
let stripe;

if (process.env.NODE_ENV === "test") {
  stripe = {
    paymentIntents: {
      create: async () => ({
        client_secret: "test_client_secret",
        id: "pi_test_123",
      }),
    },
  };
} else {
  stripe = new Stripe(process.env.STRIPE_SECRET);
}

module.exports = stripe;
