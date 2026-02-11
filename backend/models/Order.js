const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *         user:
 *           type: string
 *           description: User ID
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         orderStatus:
 *           type: string
 *           enum: [processing, shipped, delivered, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' }
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  stripePaymentIntentId: {
    type: String
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1 }); // For fetching user orders
orderSchema.index({ createdAt: -1 }); // For sorting recent orders

// Calculate total amount before saving
orderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

orderSchema.plugin(require('../plugins/performanceMonitor'));

module.exports = mongoose.model('Order', orderSchema);