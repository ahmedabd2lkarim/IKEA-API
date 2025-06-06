const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
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

const OrderSchema = new mongoose.Schema({
    total: Number,
    orderItems: [orderItemSchema],
    userID: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    paymentStatus: { type: String, default: 'Pending' }, // or "Paid", "Failed"
    paymentId: String,
    status:{
        type:String,
        enum:["pending", "delivered", "cancelled" ,"shipped" , "processing"],
        default: "processing"
    },
}, { timestamps: true });

const OrderModel = mongoose.model('order', OrderSchema);
module.exports = OrderModel;