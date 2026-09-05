const Inventory = require('../models/Inventory');

// Public — used by the pizza builder to show available options.
// Excludes items with zero stock from being selectable, but still lists them
// so the UI can show "out of stock".
exports.listInventory = async (req, res) => {
  try {
    const items = await Inventory.find({}).sort({ type: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Could not load inventory.', error: err.message });
  }
};

// Admin — same data, but this is the endpoint the admin dashboard polls/uses.
exports.adminListInventory = async (req, res) => {
  try {
    const items = await Inventory.find({}).sort({ type: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Could not load inventory.', error: err.message });
  }
};

// Admin — manual stock update for a single item.
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockCount, lowStockThreshold, price } = req.body;

    const update = {};
    if (stockCount !== undefined) update.stockCount = stockCount;
    if (lowStockThreshold !== undefined) update.lowStockThreshold = lowStockThreshold;
    if (price !== undefined) update.price = price;

    const item = await Inventory.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Inventory item not found.' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Could not update stock.', error: err.message });
  }
};
