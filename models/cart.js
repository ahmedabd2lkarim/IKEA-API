const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  prdID: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.ObjectId,
    ref: "Variant",
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    total: Number,
    cartItems: [cartItemSchema],
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

CartSchema.index({ userID: 1 });
CartSchema.index({ "cartItems.prdID": 1, "cartItems.variantId": 1 });

const CartModel = mongoose.model("Cart", CartSchema);
module.exports = CartModel;
