require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require('../models/User');

const stripeWebhook = async (req, res) => {
  console.log("Received webhook event from Stripe");
  
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const user= await User.findById(userId);
    user.homeAddress = session.metadata.address;
    user.mobileNumber = session.metadata.mobile;
    await user.save();
    try {
      const cart = await Cart.findOne({ userID:userId })

      const newOrder = new Order({
        userID: userId,
        orderItems: cart.cartItems,
        total:cart.total,
        status: "processing",
        shippingAddress: session.metadata.address,
        paymentStatus: "Paid",
        paymentId: session.payment_intent,
      });

      await newOrder.save();

      await Cart.findOneAndDelete({ userID: userId });

      console.log("Order created successfully after payment.");
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  stripeWebhook,
};