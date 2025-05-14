const mongoose = require('mongoose');

const HotspotSchema = new mongoose.Schema({
  productId: { type: String },
  top: { type: String },
  left: { type: String },
});

const ImageWithHotspotsSchema = new mongoose.Schema({
  image:  {
    en: { type: String },
    ar: { type: String }
  },
  hotspots: [HotspotSchema],
});
const TeaserSchema = new mongoose.Schema({
  title: {
    en: { type: String },
    ar: { type: String }
  },
  content: {
    en: { type: String },
    ar: { type: String }
  },

  promoImage:  {
    en: { type: String },
    ar: { type: String }
  },
  promoHotspots: [HotspotSchema],
  rightImages: [ImageWithHotspotsSchema],
  height: { type: Number, default: 800 }
}, { timestamps: true });

const CategoryTeaserSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category"},
  name: { type: String },
  teasers: [TeaserSchema]
}, { timestamps: true });

module.exports = mongoose.model('Teaser', CategoryTeaserSchema);


