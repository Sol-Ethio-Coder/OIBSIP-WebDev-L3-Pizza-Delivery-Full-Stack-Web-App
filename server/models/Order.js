const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    vegetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
      default: 'Order Received'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
