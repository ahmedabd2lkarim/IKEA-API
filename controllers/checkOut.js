require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CartModel = require("../models/cart");

const createStripeSession = async (req, res) => {
  try {
    const { address, email, mobile } = req.body;
    const cart = await CartModel.findOne({ userID: req.user.id }).populate(
      "cartItems.prdID"
    );
    console.log(cart.cartItems);
    if (!cart) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = [];

    for (const item of cart.cartItems) {
      const product = item.prdID;

      if (!product) {
        console.error("Product not found for cart item:", item);
        continue;
      }

      let itemName = product.name;
      let itemPrice = product.price.currentPrice;
      let itemImages = product.images || [];

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant) {
          itemPrice = variant.price.currentPrice;
          itemName = `${product.name} - ${variant.name || "Variant"}`;
          itemImages =
            variant.images && variant.images.length > 0
              ? variant.images
              : product.images || [];
        } else {
          console.warn(
            `Variant ${item.variantId} not found for product ${product._id}`
          );
        }
      }

      line_items.push({
        price_data: {
          currency: "EGP",
          product_data: {
            name: itemName,
            images: itemImages,
          },
          unit_amount: Math.round(itemPrice * 100), 
        },
        quantity: item.quantity,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/profile/MyOrders`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { userId: req.user.id, address, email, mobile },
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
