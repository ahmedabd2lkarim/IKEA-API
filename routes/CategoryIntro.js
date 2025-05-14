const express = require("express");
const router = express.Router();
const {
    createIntro,
    getIntroByCategoryId,
    updateIntroByCategoryId
} = require("../controllers/CategoryIntro");

router.post("/", createIntro);
router.get("/:categoryId", getIntroByCategoryId);
router.put("/:categoryId", updateIntroByCategoryId);

module.exports = router;
