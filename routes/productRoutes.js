const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const  checkRole  = require('../middleware/permissions');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getVendorProducts,
} = require("../controllers/productController");

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

router.use(auth, checkRole('vendor'));
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/vendor/products', getVendorProducts);

module.exports = router;