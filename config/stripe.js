const Stripe = require("stripe")
const key = process.env.STRIPE_SECRET;

if (!key) {
  throw new Error("❌ STRIPE_SECRET_KEY is missing in environment variables");
}

const stripe = new Stripe(key);

module.exports = stripe;