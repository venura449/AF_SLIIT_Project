require("dotenv").config();

const stripe = process.env.STRIPE_SECRET
  ? require("stripe")(process.env.STRIPE_SECRET)
  : {
      checkout: {
        sessions: {
          create: async () => ({ id: "test" })
        }
      },
      paymentIntents: {
        create: async () => ({ id: "test_payment" })
      }
    };

module.exports = stripe;