const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

router.post('/', promoController.createPromoCategory);
router.get('/:categoryId', promoController.getPromosByCategory);
router.get('/products/:categoryId', promoController.getProductsByCategory);
module.exports = router;
