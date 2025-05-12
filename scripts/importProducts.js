const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/User");
const Category = require("../models/Category_Schema");
const validateProduct = require("../utils/productValidator");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function getDefaultIds() {
  const vendor = await User.findOne({ role: "vendor" });
  const category = await Category.findOne();

  if (!vendor || !category) {
    throw new Error("Please create at least one vendor and category first");
  }

  return {
    vendorId: vendor._id,
    categoryId: category._id,
    vendorName: vendor.storeName || "Default Vendor",
    categoryName: category.name || "Default Category",
  };
}

async function importInBatches(products, batchSize = 100) {
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await Product.insertMany(batch);
    console.log(`Imported batch ${i / batchSize + 1}`);
  }
}

async function importProducts() {
  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const { vendorId, categoryId, vendorName, categoryName } = await getDefaultIds();
    const productsData = require("../data2.json");

    const preparedProducts = productsData.products
      .map((product) => ({
        ...product,
        id: product.id || mongoose.Types.ObjectId().toString(),
        vendorId,
        categoryId,
        vendorName,
        categoryName,
        name: product.name || "Product Name",
        price: {
          currency: product.price?.currency||"EGP",
          currentPrice: product.price?.currentPrice || 0,
          discounted: product.price?.discounted || false,
        },
        contextualImageUrl: product.contextualImageUrl || "default-image-url",
        measurement: {
          en: product.measurement?.en || "Default measurement",
          ar: product.measurement?.ar || "القياس الافتراضي",
        },
        // Add empty variants array if none exist
        variants: product.variants?.map(variant => ({
          id: variant.id || mongoose.Types.ObjectId().toString(),
          name: variant.name || "Default Variant",
          price: {
            currency:variant.price?.currency || product.price?.currency || "EGP",
            currentPrice: variant.price?.currentPrice || product.price?.currentPrice || 0,
            discounted: variant.price?.discounted || false,
          },
          contextualImageUrl: variant.contextualImageUrl || product.contextualImageUrl || "default-image-url",
          measurement: {
            en: variant.measurement?.en || product.measurement?.en || "Default measurement",
            ar: variant.measurement?.ar || product.measurement?.ar || "القياس الافتراضي",
          },
          typeName: {
            en: variant.typeName?.en || product.typeName?.en || "",
            ar: variant.typeName?.ar || product.typeName?.ar || "",
          },
          imageAlt: {
            en: variant.imageAlt?.en || product.name || "Default Alt Text",
            ar: variant.imageAlt?.ar || product.name || "النص البديل الافتراضي",
          }
        })) || []
      }))
      .filter((product) => {
        const validation = validateProduct(product);
        if (!validation.isValid) {
          console.warn(`Skipping invalid product: ${validation.errors.join(", ")}`);
          return false;
        }
        return true;
      });

    await importInBatches(preparedProducts);
    console.log(`Successfully imported ${preparedProducts.length} products`);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
  }
}

importProducts();
