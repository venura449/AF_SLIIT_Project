const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Donation = require("../../models/donations/Donation");
const Need = require("../../models/donations/Need");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify Stripe signature (VERY IMPORTANT)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ===============================
  // PAYMENT SUCCESS EVENT
  // ===============================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const donationId = session.metadata?.donationId;

    try {
      const donation = await Donation.findById(donationId);

      if (!donation) {
        console.log("❌ Donation not found");
        return res.status(404).json({ message: "Donation not found" });
      }

      // ===============================
      // UPDATE DONATION
      // ===============================
      donation.paymentStatus = "Paid";
      donation.status = "Confirmed";
      donation.transactionId = session.payment_intent;

      await donation.save();

      // ===============================
      // UPDATE NEED (IMPORTANT)
      // ===============================
      const need = await Need.findById(donation.need);

      if (need && (donation.donationType === "Cash" || donation.donationType === "Card")) {
        need.currentAmount =
          Number(need.currentAmount) + Number(donation.amount);

        need.goalAmount =
          Number(need.goalAmount) - Number(donation.amount);

        if (need.goalAmount <= 0) {
          need.goalAmount = 0;
          need.status = "Fulfilled";
        } else {
          need.status = "Partially Funded";
        }

        await need.save();
      }

      console.log("Payment confirmed via Stripe webhook");
    } catch (error) {
      console.log("DB Error:", error.message);
    }
  }

  res.json({ received: true });
};