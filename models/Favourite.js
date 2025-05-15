const mongoose = require('mongoose');
const Product = require('./product');

// const productSchema = new mongoose.Schema({
//     id: String,
//     name: String,
//     description: String,
//     currentPrice: Number,
//     previousPrice: Number,
//     quantity: Number,
//     quantityInStock: Number,
//     unitPrice: Number,
//     unitType: String,
//     hasNewLowerPrice: Boolean,
//     rating: Number,
//     reviewCount: Number,
//     isTopSeller: Boolean,
//     inStock: Boolean,
//     runningLow: Boolean,
//     location: String,
//     imageUrl: String,
//     hoverImageUrl: String
// });
const productSchema = Product.schema;
const listSchema = new mongoose.Schema({
    name: String,
    items: [productSchema]
});
const favouriteSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lists: [listSchema]
}, { timestamps: true });
module.exports = mongoose.model('Favourite', favouriteSchema);
