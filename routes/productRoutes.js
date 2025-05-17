const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const checkRole = require("../middleware/permissions");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getVendorProducts,
  getProductsByColor,
  getVendorProductById,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
  getProductVariants,
  getProductsVendorByCategory,
} = require("../controllers/productController");

router.get("/filter/color", getProductsByColor);
router.get("/category/:categoryId", getProductsByCategory);

router
  .get("/vendor", auth, checkRole("vendor"), getVendorProducts)
  .post("/vendor", auth, checkRole("vendor"), createProduct);
router
  .get("/vendor/:id", auth, checkRole("vendor"), getVendorProductById)
  .patch("/vendor/:id", auth, checkRole("vendor"), updateProduct)
  .delete("/vendor/:id", auth, checkRole("vendor"), deleteProduct);

router
  .route("/vendor/:productId/variants")
  .get(auth, checkRole("vendor"), getProductVariants)
  .post(auth, checkRole("vendor"), addVariant);

router
  .route("/vendor/:productId/variants/:variantId")
  .get(auth, checkRole("vendor"), getVariantById)
  .patch(auth, checkRole("vendor"), updateVariant)
  .delete(auth, checkRole("vendor"), deleteVariant);

router.get(
  "/vendor/category/:categoryId",
  auth,
  checkRole("vendor"),
  getProductsVendorByCategory
);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/:productId/variants", getProductVariants);
router.get("/:productId/variants/:variantId", getVariantById);

module.exports = router;
