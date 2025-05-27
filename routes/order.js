const express = require("express");
const router = express.Router();
const { getAllOrders,
    getOrdersByVendor,
    createOrder,
    updateOrderStatus,
    getUserOrders,
    getOrderById } = require("../controllers/order");
const { auth } = require("../middleware/auth");

router.get('/',auth,getAllOrders);     

router.get('/showAllMyOrders',auth,getUserOrders);

router.get('/vendor',auth,getOrdersByVendor)  

router.get('/:id',auth,getOrderById);

router.patch('/status/:id',auth,updateOrderStatus);

router.post('/newOrder',auth,createOrder);


module.exports = router;