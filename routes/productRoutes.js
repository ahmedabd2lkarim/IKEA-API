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
} = require("../controllers/productController");

router.get("/category/:categoryId", getProductsByCategory);
router.get("/filter/color", getProductsByColor);

router.get("/vendor", auth, checkRole("vendor"), getVendorProducts);
router.post("/", auth, checkRole("vendor"), createProduct);
router.patch("/:id", auth, checkRole("vendor"), updateProduct);
router.delete("/:id", auth, checkRole("vendor"), deleteProduct);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
