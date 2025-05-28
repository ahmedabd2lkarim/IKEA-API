require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CartModel = require("../models/cart");
const OrderModel = require("../models/order");
const Product = require("../models/product");
// //200 => ok              //201 => created
// //202 => accepted        //400 => bad request
// //401 => unauthorized    //403 => forbidden     //404 => not found
let getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only Admins");
    }
    let orders = await OrderModel.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

let getOrdersByVendor = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendorProducts = await Product.find({ vendorId }).select('_id');

    const productIds = vendorProducts.map(product => product._id);
    let orders = await OrderModel.find({ 'orderItems.prdID': { $in: productIds } })
      .populate('userID', 'name email mobileNumber homeAddress')
      .populate({
        path: 'orderItems.prdID',
        model: 'Product',
        select: 'name price images vendorId'
      });

    orders.forEach((order) => {
      let orderItems = [], subTotal = 0;
      order.orderItems.forEach((item) => {
        if (String(item.prdID.vendorId) == vendorId) {
          orderItems.push(item);
          subTotal += (item.quantity * item.prdID.price.currentPrice)
        }
      })
      order.orderItems = orderItems;
      order.total = subTotal;
    })

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

let updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only Admins can update order status");
    }
    const { id } = req.params;
    const status = req.body;
    if (!status) {
      return res.status(400).json("Status must be provided");
    }
    const order = await OrderModel.findByIdAndUpdate(id, status, { runValidators: true, new: true });
    res.status(202).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

let createOrder = async (req, res) => {
  const { shippingAddress, paymentInfo } = req.body;
  try {
    const cart = await CartModel.findOne({ userID: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const order = new OrderModel({
      userId: req.user.id,
      orderItems: cart.cartItems,
      total: cart.total,
      shippingAddress,
      paymentStatus: 'Paid',
      paymentId: paymentInfo.id,
      status: 'Processing'
    });
    await order.save();

    await CartModel.findOneAndDelete({ userID: req.user.id });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Could not create order' });
  }
}

let getUserOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ userID: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

let getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await OrderModel.findOne({ _id: id, userID: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

let cancelOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await OrderModel.findOne({ _id: id, userID: req.user.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }
    console.log(order);
    
    if (order.paymentId) {
      try {
        await stripe.refunds.create({
          payment_intent: order.paymentId,
        });
      } catch (refundError) {
        return res.status(500).json({ message: "Refund failed", error: refundError.message });
      }
    }

     for (const item of newOrder.orderItems) {
        const product = await Product.findById(item.prdID);
        if (product) {
          product.stockQuantity += item.quantity;
          await product.save();
        }
      }


    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ message: 'Order cancelled and refunded successfully' });
  }
  catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}

module.exports = {
  getAllOrders,
  getOrdersByVendor,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  cancelOrder
};