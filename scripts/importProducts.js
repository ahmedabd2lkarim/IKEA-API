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
  const totalBatches = Math.ceil(products.length / batchSize);
  let successful = 0;

  try {
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch, { ordered: false });
      successful++;
      console.log(`Imported batch ${successful}/${totalBatches}`);
    }
  } catch (error) {
    console.error(`Error importing batch: ${error.message}`);
    throw error;
  }
}

function extractProductColors(imageAlt) {
  const colors = {
    en: "Default",
    ar: "افتراضي",
  };

  try {
    if (imageAlt?.en) {
      const parts = imageAlt.en.split(",");
      if (parts.length >= 2) {
        colors.en = parts[1].trim();
      }
    }

    if (imageAlt?.ar) {
      const parts = imageAlt.ar.split(",");
      if (parts.length >= 2) {
        colors.ar = parts[1].trim();
      }
    }
  } catch (error) {
    console.warn(`Error extracting colors from imageAlt:`, error);
  }

  return colors;
}

async function importProducts() {
  try {
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const { vendorId, categoryId, vendorName, categoryName } =
      await getDefaultIds();
    const productsData = require("../data2.json");

    let importStats = {
      totalProducts: productsData.products.length,
      processedProducts: 0,
      productsWithVariants: 0,
      totalVariants: 0,
      failedVariants: 0,
    };

    const preparedProducts = productsData.products
      .map((product) => {
        importStats.processedProducts++;

        try {
          const measurementString = product.measurement?.en || "";
          let measurement = {};

          if (measurementString === "") {
            measurement = null;
          } else if (measurementString.includes("mm")) {
            const [length, unit] = measurementString.split(" ");
            measurement = {
              length: parseInt(length.trim()) || 0,
              unit: "mm",
            };
          } else if (
            !measurementString.includes("cm") &&
            !measurementString.includes("mm") &&
            measurementString.includes("m")
          ) {
            const [length, unit] = measurementString.split(" ");
            measurement = {
              length: parseFloat(length.trim()) || 0,
              unit: "m",
            };
          } else if (measurementString.includes("cm")) {
            const res = measurementString.split(" ");
            if (!res[0].includes("x")) {
              const [length, unit] = res;
              measurement = {
                length: parseInt(length.trim()) || 0,
                unit: "cm",
              };
            } else {
              const dimensions = res[0].split("x");
              if (dimensions.length === 2) {
                measurement = {
                  unit: "cm",
                  width: dimensions[0],
                  height: dimensions[1],
                };
              } else if (dimensions.length === 2) {
                measurement = {
                  unit: res[1],
                  width: dimensions[0],
                  height: dimensions[1],
                  depth: dimensions[2],
                };
              } else if (dimensions.length === 0) {
                measurement = {};
              }
            }
          }

          ///////////////////
          // Handle color extraction from imageAlt
          const productColors = extractProductColors(product.imageAlt);

          const variants = (product.variants || [])
            .map((variant, index) => {
              try {
                const measurementString = variant.measurement?.en || "";
                let variantMeasurement = {};

                if (measurementString === "") {
                  variantMeasurement = {
                    unit: "cm",
                    width: 0,
                    height: 0,
                  };
                } else if (measurementString.includes("mm")) {
                  const [length, unit] = measurementString.split(" ");
                  variantMeasurement = {
                    unit: "mm",
                    width: parseInt(length.trim()) || 0,
                    height: parseInt(length.trim()) || 0,
                  };
                } else if (measurementString.includes("cm")) {
                  const res = measurementString.split(" ");
                  if (!res[0].includes("x")) {
                    const [length, unit] = res;
                    variantMeasurement = {
                      unit: "cm",
                      width: parseInt(length.trim()) || 0,
                      height: parseInt(length.trim()) || 0,
                    };
                  } else {
                    const dimensions = res[0]
                      .split("x")
                      .map((dim) => parseInt(dim.trim()) || 0);
                    variantMeasurement = {
                      unit: "cm",
                      width: dimensions[0] || 0,
                      height: dimensions[1] || dimensions[0] || 0,
                      depth: dimensions.length > 2 ? dimensions[2] : undefined,
                    };
                  }
                }

                const variantColors = variant.imageAlt
                  ? extractProductColors(variant.imageAlt)
                  : productColors;

                const mappedVariant = {
                  name: variant.name || "Default Variant",
                  color: {
                    en: variantColors.en,
                    ar: variantColors.ar,
                  },
                  price: {
                    currency:
                      variant.price?.currency ||
                      product.price?.currency ||
                      "EGP",
                    currentPrice:
                      variant.price?.currentPrice ||
                      product.price?.currentPrice ||
                      0,
                    discounted: variant.price?.discounted || false,
                  },
                  measurement: variantMeasurement,
                  contextualImageUrl:
                    variant.contextualImageUrl ||
                    product.contextualImageUrl ||
                    "default-image-url",
                  typeName: {
                    en: variant.typeName?.en || product.typeName?.en || "",
                    ar: variant.typeName?.ar || product.typeName?.ar || "",
                  },
                  imageAlt: {
                    en:
                      variant.imageAlt?.en ||
                      product.name ||
                      "Default Alt Text",
                    ar:
                      variant.imageAlt?.ar ||
                      product.name ||
                      "النص البديل الافتراضي",
                  },
                  images: variant.images || [
                    variant.contextualImageUrl ||
                      product.contextualImageUrl ||
                      "default-image-url",
                  ],
                  short_description: {
                    en:
                      variant.short_description?.en ||
                      product.short_description?.en ||
                      "",
                    ar:
                      variant.short_description?.ar ||
                      product.short_description?.ar ||
                      "",
                  },
                  product_details: {
                    product_details_paragraphs: {
                      en:
                        variant.product_details?.product_details_paragraphs
                          ?.en || [],
                      ar:
                        variant.product_details?.product_details_paragraphs
                          ?.ar || [],
                    },
                    expandable_sections: {
                      materials_and_care: {
                        en:
                          variant.product_details?.expandable_sections
                            ?.materials_and_care?.en || "",
                        ar:
                          variant.product_details?.expandable_sections
                            ?.materials_and_care?.ar || "",
                      },
                      details_certifications: {
                        en:
                          variant.product_details?.expandable_sections
                            ?.details_certifications?.en || "",
                        ar:
                          variant.product_details?.expandable_sections
                            ?.details_certifications?.ar || "",
                      },
                      good_to_know: {
                        en:
                          variant.product_details?.expandable_sections
                            ?.good_to_know?.en || "",
                        ar:
                          variant.product_details?.expandable_sections
                            ?.good_to_know?.ar || "",
                      },
                      safety_and_compliance: {
                        en:
                          variant.product_details?.expandable_sections
                            ?.safety_and_compliance?.en || "",
                        ar:
                          variant.product_details?.expandable_sections
                            ?.safety_and_compliance?.ar || "",
                      },
                      assembly_and_documents: {
                        en:
                          variant.product_details?.expandable_sections
                            ?.assembly_and_documents?.en || "",
                        ar:
                          variant.product_details?.expandable_sections
                            ?.assembly_and_documents?.ar || "",
                      },
                    },
                  },
                };

                importStats.totalVariants++;
                return mappedVariant;
              } catch (err) {
                importStats.failedVariants++;
                console.error(
                  `Failed to process variant ${index} for product ${product.name}: ${err.message}`
                );
                return null;
              }
            })
            .filter(Boolean); // Remove any null variants

          if (variants.length > 0) {
            importStats.productsWithVariants++;
          }

          return {
            ...product,
            vendorId,
            categoryId,
            vendorName,
            categoryName,
            color: {
              en: productColors.en,
              ar: productColors.ar,
            },
            measurement,
            images: product.images || [
              product.contextualImageUrl || "default-image-url",
            ],
            variants,
            inStock: true,
            stockQuantity: Math.floor(Math.random() * (30 - 20 + 1)) + 20,
          };
        } catch (err) {
          console.error(
            `Failed to process product ${product.name}: ${err.message}`
          );
          return null;
        }
      })
      .filter(Boolean);

    // Log import statistics
    console.log(`
Import Statistics:
- Total products processed: ${importStats.processedProducts}
- Products with variants: ${importStats.productsWithVariants}
- Total variants processed: ${importStats.totalVariants}
- Failed variants: ${importStats.failedVariants}
`);

    await Product.insertMany(preparedProducts, { ordered: false });
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
