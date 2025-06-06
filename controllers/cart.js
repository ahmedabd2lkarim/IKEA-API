const CartModel = require("../models/cart");
const { Product } = require("../models/product");

let getCurrentUserCart = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json("Only Users can delete cart");
    }
    let userCart = await CartModel.find({ userID: req.user.id });
    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

let clearCart = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json("Only Users can delete cart");
    }
    const { id } = req.params;
    let cart = await CartModel.findOneAndDelete({
      _id: id,
      userID: req.user.id,
    });
    if (!cart) {
      return res.status(403).json({
        message: "Users can delete their carts only or cart not found",
      });
    }
    res.status(200).json({ message: "cart deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

let addTOCart = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json("Only Users can add to cart");
    }

    let { prdID, quantity } = req.body;
    console.log("Request body:", req.body);

    let productId = prdID.prdID || prdID;
    let variantId = prdID.variantId || null;

    let cart = await CartModel.findOne({ userID: req.user.id });

    if (!cart) {
      cart = new CartModel({ userID: req.user.id, cartItems: [] });
    }

    let existingItem = cart.cartItems.find((item) => {
      if (variantId) {
        return (
          item.prdID.toString() === productId.toString() &&
          item.variantId &&
          item.variantId.toString() === variantId.toString()
        );
      } else {
        return (
          item.prdID.toString() === productId.toString() && !item.variantId
        );
      }
    });

    if (existingItem) {
      existingItem.quantity += quantity;

      if (existingItem.quantity <= 0) {
        cart.cartItems = cart.cartItems.filter((item) => item !== existingItem);
      }
    } else {
      if (quantity > 0) {
        const newItem = {
          prdID: productId,
          quantity: quantity,
        };

        if (variantId) {
          newItem.variantId = variantId;
        }

        cart.cartItems.push(newItem);
      }
    }

    let subTotal = 0;
    for (const item of cart.cartItems) {
      try {
        const product = await Product.findById(item.prdID);
        if (product) {
          let price;
          if (item.variantId) {
            const variant = product.variants.id(item.variantId);
            price = variant
              ? variant.price.currentPrice
              : product.price.currentPrice;
          } else {
            price = product.price.currentPrice;
          }
          subTotal += price * item.quantity;
        }
      } catch (err) {
        console.error("Error calculating price for item:", err);
      }
    }

    cart.total = subTotal; 
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  clearCart,
  addTOCart,
  getCurrentUserCart,
};
