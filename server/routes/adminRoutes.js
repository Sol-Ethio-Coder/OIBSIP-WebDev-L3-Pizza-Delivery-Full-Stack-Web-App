const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const inventoryController = require('../controllers/inventoryController');
const orderController = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/auth');

// Admin login is intentionally its own endpoint — there is no public
// registration flow that can create an admin account.
router.post('/login', adminAuthController.login);

router.use(requireAdmin);

router.get('/inventory', inventoryController.adminListInventory);
router.patch('/inventory/:id', inventoryController.updateStock);

router.get('/orders', orderController.allOrders);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router;
