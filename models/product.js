const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      en: { type: String },
      ar: { type: String },
    },
    price: {
      currency: {
        type: String,
        required: true,
      },
      currentPrice: {
        type: Number,
        required: true,
      },
      discounted: {
        type: Boolean,
        default: false,
      },
    },
    contextualImageUrl: {
      type: String,
      required: false,
    },
    measurement: {
      unit: {
        type: String,
        required: false,
      },
      width: {
        type: Number,
        required: false,
      },
      height: {
        type: Number,
        required: false,
      },
      depth: {
        type: Number,
        required: false,
      },
      length: {
        type: Number,
        required: false,
      },
    },
    typeName: {
      en: { type: String },
      ar: { type: String },
    },
    imageAlt: {
      en: { type: String },
      ar: { type: String },
    },
    short_description: {
      en: { type: String },
      ar: { type: String },
    },
    product_details: {
      product_details_paragraphs: {
        en: [String],
        ar: [String],
      },
      expandable_sections: {
        materials_and_care: {
          en: { type: String },
          ar: { type: String },
        },
        details_certifications: {
          en: { type: String },
          ar: { type: String },
        },
        good_to_know: {
          en: { type: String },
          ar: { type: String },
        },
        safety_and_compliance: {
          en: { type: String },
          ar: { type: String },
        },
        assembly_and_documents: {
          en: { type: String },
          ar: { type: String },
        },
      },
    },
    images: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

variantSchema.virtual("fullUrl").get(function () {
  const categorySlug =
    this.parent().categoryName?.toLowerCase().replace(/\s+/g, "-") ||
    "category";
  return `/products/${categorySlug}/${this.parent()._id}/variants/${this._id}`;
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    color: {
      en: { type: String },
      ar: { type: String},
    },
    price: {
      currency: {
        type: String,
        required: true,
      },
      currentPrice: {
        type: Number,
        required: true,
      },
      discounted: {
        type: Boolean,
        default: false,
      },
    },

    measurement: {
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      depth: {
        type: Number,
      },
    },
    typeName: {
      en: { type: String },
      ar: { type: String },
    },

    contextualImageUrl: {
      type: String,
    },
    imageAlt: {
      en: { type: String },
      ar: { type: String },
    },
    images: [String],
    short_description: {
      en: { type: String },
      ar: { type: String },
    },
    product_details: {
      product_details_paragraphs: {
        en: [String],
        ar: [String],
      },
      expandable_sections: {
        materials_and_care: {
          en: { type: String },
          ar: { type: String },
        },
        details_certifications: {
          en: { type: String },
          ar: { type: String },
        },
        good_to_know: {
          en: { type: String },
          ar: { type: String },
        },
        safety_and_compliance: {
          en: { type: String },
          ar: { type: String },
        },
        assembly_and_documents: {
          en: { type: String },
          ar: { type: String },
        },
      },
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    vendorName: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },

    variants: [variantSchema],

    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("fullUrl").get(function () {
  const categorySlug =
    this.categoryName?.toLowerCase().replace(/\s+/g, "-") || "category";
  return `/products/${categorySlug}/${this._id}`;
});

productSchema.index({
  name: "text",
  "short_description.en": "text",
  "short_description.ar": "text",
});
productSchema.index({ "price.currentPrice": 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ inStock: 1 });
productSchema.index({ "color.en": 1, "color.ar": 1 });
productSchema.index({ "measurement.width": 1 });
productSchema.index({ "measurement.height": 1 });
productSchema.index({ "measurement.depth": 1 });

productSchema.pre("save", async function (next) {
  if (this.isModified("vendorId") || this.isNew) {
    try {
      const User = mongoose.model("User");
      const vendor = await User.findById(this.vendorId).select("storeName");
      if (vendor) {
        this.vendorName = vendor.storeName;
      }
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("categoryId") || this.isNew) {
    try {
      const Category = mongoose.model("Category");
      const category = await Category.findById(this.categoryId).select("name");
      if (category) {
        this.categoryName = category.name;
      }
    } catch (err) {
      return next(err);
    }
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
