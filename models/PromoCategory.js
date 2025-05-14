const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  title: {
    en: String,
    ar: String,
  },
  description: {
    en: String,
    ar: String,
  },
  images: {
    en: String,
    ar: String,
  },
});

const promoCategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category"},
  name: { type: String },
  promos: [promoSchema],
});

module.exports = mongoose.model('PromoCategory', promoCategorySchema);
