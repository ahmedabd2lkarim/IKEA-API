const validateProduct = (product) => {
    const errors = [];

    if (!product.name) errors.push('Name is required');
    if (!product.price?.currentPrice) errors.push('Price is required');
    if (!product.contextualImageUrl) errors.push('Image URL is required');

    
    if (product.price?.currentPrice && product.price.currentPrice < 0) {
        errors.push('Price must be positive');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = validateProduct;