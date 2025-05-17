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
  try {
    
    const { 
      page = 1, 
      limit = 20, 
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
  } catch (error) {
    es.status(500).json({ error: error.message });
}
});


exports.getProductById = async (req, res) => {
    try {
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
            return res.status(403).json({ message: "Access denied: Only vendors allowed" });
        }

    
        const product = await Product.findOne({
            _id: req.params.id,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
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
          console.log(req.user.role);
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

exports.getProductsVendorByCategory = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json({ message: "Only vendors can access this endpoint" });
        }
        
        const products = await Product.find({ categoryId: req.params.categoryId, vendorId: req.user.id })
            .populate('categoryId', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Category not found" });
    }
};
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.categoryId })
            .populate('categoryId', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductsByColor = async (req, res) => {
  try {
    const { color, language = 'en' } = req.query;
    const query = {};
    
    if (color) {

      query[`color.${language}`] = new RegExp(color, 'i');
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductVariants = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product.variants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getVariantById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        const variant = product.variants.id(req.params.variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        
        res.json(variant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.addVariant = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json({ message: "Only vendors can add variants" });
        }

        const product = await Product.findOne({
            _id: req.params.productId,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        product.variants.push({
            ...req.body,
            vendorId: req.user.id,
            categoryId: product.categoryId
        });

        await product.save();
        res.status(201).json(product.variants[product.variants.length - 1]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateVariant = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json({ message: "Only vendors can update variants" });
        }

        const product = await Product.findOne({
            _id: req.params.productId,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        const variant = product.variants.id(req.params.variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        Object.assign(variant, req.body);
        await product.save();
        
        res.json(variant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.deleteVariant = async (req, res) => {
    try {
        if (req.user.role !== "vendor") {
            return res.status(403).json({ message: "Only vendors can delete variants" });
        }

        const product = await Product.findOne({
            _id: req.params.productId,
            vendorId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

   
        product.variants.pull({ _id: req.params.variantId });
        await product.save();
        
        res.json({ message: "Variant deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};