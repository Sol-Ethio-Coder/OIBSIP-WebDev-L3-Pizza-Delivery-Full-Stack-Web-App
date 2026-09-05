const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
      required: true
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 }, // added cost to a pizza
    stockCount: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, required: true, default: 20 },
    lastAlertSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
