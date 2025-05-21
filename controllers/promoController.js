const PromoCategory = require('../models/PromoCategory');
const Product = require("../models/product");

exports.createPromoCategory = async (req, res) => {
    try {
      const { categoryId, name, promos } = req.body;
      const newCategory = new PromoCategory({ categoryId, name, promos });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getPromosByCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
  
      let category;
  
      if (categoryId === 'home' || !categoryId || categoryId === 'null') {
        category = await PromoCategory.findOne({ name: 'home' });
      } else {
        category = await PromoCategory.findOne({ categoryId });
      }
  
      if (!category) return res.status(404).json({ message: 'Category not found' });
  
      res.json(category.promos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.getProductsByCategory = async (req, res) => {
      try {
          const products = await Product.find({ categoryId: req.params.categoryId });
          res.json(products);
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  };
  