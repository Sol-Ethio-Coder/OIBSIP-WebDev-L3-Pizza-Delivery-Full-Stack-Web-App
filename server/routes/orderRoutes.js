const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireUser } = require('../middleware/auth');

router.use(requireUser);

router.post('/checkout', orderController.checkout);
router.post('/verify', orderController.verifyPayment);
router.get('/my', orderController.myOrders);

module.exports = router;
