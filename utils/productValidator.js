function validateProduct(product) {
  const errors = [];

  // Required fields check
  if (!product.name) errors.push("Missing product name");
  if (!product.price?.currentPrice) errors.push("Missing price");
  
  // Variant validation
  if (product.variants?.length > 0) {
    product.variants.forEach((variant, index) => {
      if (!variant.name) errors.push(`Variant ${index}: Missing name`);
      if (!variant.measurement?.width) errors.push(`Variant ${index}: Missing measurement width`);
      if (!variant.measurement?.height) errors.push(`Variant ${index}: Missing measurement height`);
      if (!variant.color?.en || !variant.color?.ar) errors.push(`Variant ${index}: Missing color translations`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = validateProduct;