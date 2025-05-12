const Product = require("../models/product");
const { catchAsync } = require('../utils/errorHandler');


exports.createProduct = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json("Only Vendors");
        }
        const product = new Product({ ...req.body, vendorId: req.user.id });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getAllProducts = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = '-createdAt',
    category,
    priceMin,
    priceMax,
    search
  } = req.query;

  const query = {};
  

  if (category) query.categoryId = category;
  if (priceMin || priceMax) {
    query['price.currentPrice'] = {};
    if (priceMin) query['price.currentPrice'].$gte = Number(priceMin);
    if (priceMax) query['price.currentPrice'].$lte = Number(priceMax);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'short_description.en': { $regex: search, $options: 'i' } },
      { 'short_description.ar': { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('categoryId', 'name');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: products
  });
});


exports.getProductById = async (req, res) => {
    try {
        if (req.user.role == "vendor") {
            return res.status(403).json("Only Admins and Users");
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json("Only Vendors");
        }
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        if (req.user.role == "user") {
            return res.status(403).json("Only Admins and Vendors");
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getVendorProducts = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json("Only Vendors");
        }
        const products = await Product.find({ vendorId: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getVendorProductById = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json("Only Vendors can access this endpoint");
    }

    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.user.id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.categoryId, vendorId: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};