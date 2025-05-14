const express = require('express');
const router = express.Router();
const Teaser = require('../models/Teaser');


router.post("/", async (req, res) => {
  try {
    const teaser = new Teaser(req.body);
    const saved = await teaser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:key?", async (req, res) => {
  try {
    const key = req.params.key;

    let teaser;
    if (!key || key.toLowerCase() === "home") {
      teaser = await Teaser.findOne({ name: "home" });
    } else {
      teaser = await Teaser.findOne({ categoryId: key });
    }

    if (!teaser) return res.status(404).json({ error: "Teaser not found" });

    res.json(teaser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.get("/", async (req, res) => {
  try {
    const teasers = await Teaser.find();
    res.json(teasers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
