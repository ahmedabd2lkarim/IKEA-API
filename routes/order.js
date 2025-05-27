const express = require("express");
const router = express.Router();
const { getAllOrders,
    getOrdersByVendor,
    createOrder,
    updateOrderStatus,
    getUserOrders,
    cancelOrder,
    getOrderById } = require("../controllers/order");
const { auth } = require("../middleware/auth");

router.get('/',auth,getAllOrders);     

router.get('/showAllMyOrders',auth,getUserOrders);

router.get('/vendor',auth,getOrdersByVendor)  

router.get('/:id',auth,getOrderById);

router.patch('/status/:id',auth,updateOrderStatus);

router.post('/newOrder',auth,createOrder);

router.patch('/cancel/:id',auth, cancelOrder);

module.exports = router;