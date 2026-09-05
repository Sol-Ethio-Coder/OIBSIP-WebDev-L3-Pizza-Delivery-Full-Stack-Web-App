const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Public — the pizza builder needs this before a user even logs in to browse.
router.get('/', inventoryController.listInventory);

module.exports = router;
