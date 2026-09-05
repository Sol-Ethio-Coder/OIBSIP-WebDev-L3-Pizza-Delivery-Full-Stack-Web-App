const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Step 1 of checkout: validate the chosen ingredients are in stock,
 * compute the price, create a Razorpay order, and store a local Order
 * with paymentStatus 'pending'.
 */
exports.checkout = async (req, res) => {
  try {
    const { baseId, sauceId, cheeseId, vegetableIds = [] } = req.body;

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({ message: 'Base, sauce, and cheese are required.' });
    }

    const ids = [baseId, sauceId, cheeseId, ...vegetableIds];
    const items = await Inventory.find({ _id: { $in: ids } });

    if (items.length !== new Set(ids).size) {
      return res.status(400).json({ message: 'One or more selected items were not found.' });
    }

    const outOfStock = items.find(i => i.stockCount <= 0);
    if (outOfStock) {
      return res.status(409).json({ message: `${outOfStock.name} is currently out of stock.` });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    const order = await Order.create({
      user: req.auth.id,
      base: baseId,
      sauce: sauceId,
      cheese: cheeseId,
      vegetables: vegetableIds,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
      orderStatus: 'Order Received'
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed.', error: err.message });
  }
};

/**
 * Step 2 of checkout: verify the Razorpay signature, mark the order paid,
 * and decrement stock for the ingredients used.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order mismatch.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement stock for every ingredient used in this order.
    const ingredientIds = [order.base, order.sauce, order.cheese, ...order.vegetables];
    await Inventory.updateMany(
      { _id: { $in: ingredientIds } },
      { $inc: { stockCount: -1 } }
    );

    res.json({ message: 'Payment confirmed. Order placed!', order });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed.', error: err.message });
  }
};

// User — their own orders, newest first. Polled from the dashboard for
// live status updates.
exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.auth.id })
      .populate('base sauce cheese vegetables')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
};

// Admin — every order, newest first.
exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('base sauce cheese vegetables')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
};

// Admin — update an order's status.
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order.', error: err.message });
  }
};
