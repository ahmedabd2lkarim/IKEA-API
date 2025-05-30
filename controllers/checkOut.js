require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);
const CartModel = require("../models/cart");

const createStripeSession = async (req, res) => {
  try {
    const {address,email,mobile} = req.body;
    const cart = await CartModel.findOne({ userID: req.user.id }).populate("cartItems.prdID");
      
    if (!cart) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.cartItems.map(item => ({
      price_data: {
        currency: "EGP",
        product_data: {
          name: item.prdID.name,
          images: item.prdID.images,     
        },
        unit_amount: item.prdID.price.currentPrice*100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/profile/MyOrders`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { userId: req.user.id , address, email, mobile },
    });
    res.status(200).json({ sessionURL: session.url });
  } catch (error) {
    console.error("Stripe session creation failed", error);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
};

module.exports = {
  createStripeSession,
};