const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    emoji: String,
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true, maxlength: 100 },
    specs: {
      moteur: String,
      vitesse: String,
      reservoir: String,
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    inStock: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
