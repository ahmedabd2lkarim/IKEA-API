function validateProduct(product) {
  const errors = [];
  if (!product.categoryId) errors.push("Missing category ID");
  if (!product.vendorId) errors.push("Missing category ID");
  if (!product.name) errors.push("Missing product name");
  if (!product.price?.currentPrice) errors.push("Missing price");
  if (!product.price?.currency) errors.push("Missing currency");
  if (!product.price?.discounted) errors.push("Missing discounted status");

  if (product.variants?.length > 0) {
    product.variants.forEach((variant, index) => {
      if (!variant.name) errors.push(`Variant ${index}: Missing name`);
      if (!variant.measurement?.width)
        errors.push(`Variant ${index}: Missing measurement width`);
      if (!variant.measurement?.height)
        errors.push(`Variant ${index}: Missing measurement height`);
      if (!variant.color?.en || !variant.color?.ar)
        errors.push(`Variant ${index}: Missing color translations`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = validateProduct;
