const Intro = require("../models/CategoryIntro");

const createIntro = async (req, res) => {
    try {
        const { categoryId, title, content } = req.body;
        const newIntro = new Intro({ categoryId, title, content });
        const savedIntro = await newIntro.save();
        res.status(201).json(savedIntro);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getIntroByCategoryId = async (req, res) => {
    try {
        const intro = await Intro.findOne({ categoryId: req.params.categoryId });
        if (!intro) return res.status(404).json({ message: "Intro not found" });
        res.json(intro);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateIntroByCategoryId = async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedIntro = await Intro.findOneAndUpdate(
            { categoryId: req.params.categoryId },
            { title, content },
            { new: true }
        );
        if (!updatedIntro) return res.status(404).json({ message: "Intro not found" });
        res.json(updatedIntro);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createIntro,
    getIntroByCategoryId,
    updateIntroByCategoryId
};
