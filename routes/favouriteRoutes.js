const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const {auth} = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     FavouriteList:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the favourite list
 *         userId:
 *           type: string
 *           description: ID of the user who owns the list
 *         products:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product IDs in the favourite list
 */

/**
 * @swagger
 * /api/favourites:
 *   get:
 *     summary: Get all favourite lists for the current user
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's favourite lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavouriteList'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/favourites/add-list:
 *   post:
 *     summary: Create a new favourite list
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the new favourite list
 *     responses:
 *       201:
 *         description: Favourite list created successfully
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/favourites/add-product:
 *   put:
 *     summary: Add a product to a favourite list
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - productId
 *             properties:
 *               listId:
 *                 type: string
 *                 description: ID of the favourite list
 *               productId:
 *                 type: string
 *                 description: ID of the product to add
 *     responses:
 *       200:
 *         description: Product added to list successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: List or product not found
 */

/**
 * @swagger
 * /api/favourites/remove-product:
 *   put:
 *     summary: Remove a product from a favourite list
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - productId
 *             properties:
 *               listId:
 *                 type: string
 *                 description: ID of the favourite list
 *               productId:
 *                 type: string
 *                 description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed from list successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: List or product not found
 */

/**
 * @swagger
 * /api/favourites/rename-list:
 *   patch:
 *     summary: Rename a favourite list
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - newName
 *             properties:
 *               listId:
 *                 type: string
 *                 description: ID of the favourite list
 *               newName:
 *                 type: string
 *                 description: New name for the list
 *     responses:
 *       200:
 *         description: List renamed successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: List not found
 */

/**
 * @swagger
 * /api/favourites/delete-list:
 *   delete:
 *     summary: Delete a favourite list
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *             properties:
 *               listId:
 *                 type: string
 *                 description: ID of the favourite list to delete
 *     responses:
 *       200:
 *         description: List deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: List not found
 */

/**
 * @swagger
 * /api/favourites/list/{listId}:
 *   get:
 *     summary: Get a specific favourite list by ID
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the favourite list
 *     responses:
 *       200:
 *         description: Favourite list details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavouriteList'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: List not found
 */

router.get('/', auth,favouriteController.getFavouritesByUserId);
router.post('/add-list',auth , favouriteController.addList);
router.put('/add-product',auth , favouriteController.addProductToList);
router.put('/remove-product', auth ,favouriteController.removeProductFromList);
router.patch('/rename-list', auth ,favouriteController.renameList);
router.delete('/delete-list/:listId', auth, favouriteController.deleteList);
router.get('/list/:listId', auth, favouriteController.getListById);

module.exports = router;
