const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const {auth} = require('../middleware/auth');

router.get('/', auth,favouriteController.getFavouritesByUserId);
router.post('/add-list',auth , favouriteController.addList);
router.put('/add-product',auth , favouriteController.addProductToList);
router.put('/remove-product', auth ,favouriteController.removeProductFromList);
router.patch('/rename-list', auth ,favouriteController.renameList);
router.delete('/delete-list/:listId', auth, favouriteController.deleteList);
router.get('/list/:listId', auth, favouriteController.getListById);

module.exports = router;
