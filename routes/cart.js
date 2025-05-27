const express = require('express');
const router = express.Router();
const {auth} = require("../middleware/auth");
const {clearCart,addTOCart,getCurrentUserCart,getAllOrders,deleteOrderItem,getOrdersByVendor,getCurrentUserOrder,deleteOrder,createOrder,updateOrderStatus,updateOrderAmount} = require('../controllers/cart')

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - products
 *         - totalAmount
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product
 *         totalAmount:
 *           type: number
 *           description: Total amount of the order
 *         status:
 *           type: string
 *           enum: [pending, processing, delivered, cancelled,shipped]
 *           description: Current status of the order
 *         userId:
 *           type: string
 *           description: ID of the user who placed the order
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get all orders (admin access)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/cart/showAllMyOrders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/cart/vendor:
 *   get:
 *     summary: Get orders for vendor
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for vendor's products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/cart/newOrder:
 *   post:
 *     summary: Create a new order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 */

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */

/**
 * @swagger
 * /api/cart/amount/{id}:
 *   patch:
 *     summary: Update order amount
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalAmount
 *             properties:
 *               totalAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order amount updated successfully
 */

/**
 * @swagger
 * /api/cart/status/{id}:
 *   patch:
 *     summary: Update order status
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */

/**
 * @swagger
 * /api/cart/deleteItem/{id}:
 *   patch:
 *     summary: Delete item from order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item removed from order successfully
 */

router.get('/showMyCart',auth,getCurrentUserCart)

router.patch('/cartOP',auth,addTOCart)

router.delete('/:id',auth,clearCart)

module.exports = router;