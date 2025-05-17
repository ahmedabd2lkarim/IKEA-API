const mongoose = require("mongoose");

const introSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    title: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    content: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model("CategoryIntro", introSchema);
