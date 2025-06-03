require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/User");
const { Product } = require("../models/product");

const stripeWebhook = async (req, res) => {
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
    const user = await User.findById(userId);
    user.homeAddress = session.metadata.address;
    user.mobileNumber = session.metadata.mobile;
    await user.save();
    try {
      const cart = await Cart.findOne({ userID: userId });

      const newOrder = new Order({
        userID: userId,
        orderItems: cart.cartItems,
        total: cart.total,
        status: "processing",
        shippingAddress: session.metadata.address,
        paymentStatus: "Paid",
        paymentId: session.payment_intent,
      });

      await newOrder.save();

      await Cart.findOneAndDelete({ userID: userId });
      for (const item of newOrder.orderItems) {
        const product = await Product.findById(item.prdID);

        if (!product) {
          console.error(`Product not found: ${item.prdID}`);
          continue;
        }

        if (item.variantId) {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            if (variant.stockQuantity !== undefined) {
              variant.stockQuantity = Math.max(
                0,
                variant.stockQuantity - item.quantity
              );
            }

            await product.save();
            console.log(
              `Updated stock for variant ${item.variantId} of product ${item.prdID}`
            );
          } else {
            console.error(
              `Variant ${item.variantId} not found in product ${item.prdID}`
            );
          }
        } else {
          if (product.stockQuantity !== undefined) {
            product.stockQuantity = Math.max(
              0,
              product.stockQuantity - item.quantity
            );
            await product.save();
            console.log(`Updated stock for main product ${item.prdID}`);
          }
        }
      }
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
