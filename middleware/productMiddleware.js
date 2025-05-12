const Product = require('../models/product');

exports.checkProductOwnership = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  if (product.vendorId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to perform this action'
    });
  }

  req.product = product;
  next();
};

exports.validateProduct = (req, res, next) => {
  const { name, price, measurement } = req.body;

  if (!name || !price || !measurement) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required fields'
    });
  }

  if (price.currentPrice <= 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Price must be greater than 0'
    });
  }

  next();
};