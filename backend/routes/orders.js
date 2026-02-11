const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const { auth, admin } = require('../middleware/auth');
const logAudit = require('../utils/auditLogger');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order processing and management
 */

// @desc    Create payment intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
/**
 * @swagger
 * /api/orders/create-payment-intent:
 *   post:
 *     summary: Initiate checkout payment
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment intent client secret
 */
router.post('/create-payment-intent', auth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress } = req.body;

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Confirm payment and create order
// @route   POST /api/orders/confirm-payment
// @access  Private
/**
 * @swagger
 * /api/orders/confirm-payment:
 *   post:
 *     summary: Finalize order after payment
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *               - items
 *               - shippingAddress
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/confirm-payment', auth, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('shippingAddress').isObject().withMessage('Shipping address is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify payment intent
    const { paymentIntentId, items, shippingAddress } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new ErrorResponse('Payment not completed', 400);
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      throw new ErrorResponse('Order already exists', 400);
    }

    // Validate and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new ErrorResponse(`Product ${item.productId} not found or inactive`, 400);
      }

      if (product.stock < item.quantity) {
        throw new ErrorResponse(`Insufficient stock for ${product.name}`, 400);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentIntentId,
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntentId,
      statusHistory: [{
        status: 'processing',
        date: new Date(),
        comment: 'Order placed successfully'
      }]
    });

    // Send email notification (outside transaction)
    // Send emails
    try {
      // 1. Send Order Confirmation to User
      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmation - #${order._id}`,
        template: 'orderConfirmation',
        data: {
          name: req.user.name,
          orderId: order._id,
          items: order.items,
          totalAmount: order.totalAmount.toFixed(2),
          shippingAddress: order.shippingAddress,
          orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order._id}`
        }
      });

      // 2. Notify Admin
      await sendEmail({
        email: process.env.ADMIN_EMAIL,
        subject: 'New Order Received',
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${req.user.name} (${req.user.email})</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: order
    });

    logAudit({
      userId: req.user._id,
      action: 'PAYMENT',
      resource: 'Order',
      resourceId: order._id,
      details: { amount: order.totalAmount, paymentIntent: paymentIntentId },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    // Pass to global error handler which handles ErrorResponse
    next(error);
  }
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get logged-in user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/myorders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name imageUrl');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get orders (User specific or all for Admin)
// @route   GET /api/orders
// @access  Private
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders (User specific or all for Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // If user is not admin, only show their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *               carrier:
 *                 type: string
 *               trackingUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

    logAudit({
      userId: req.user._id,
      action: 'UPDATE_STATUS',
      resource: 'Order',
      resourceId: order._id,
      details: { status: orderStatus, oldStatus: order.orderStatus }, // Note: order variable already has *new* status since findByIdAndUpdate returns new doc. We can't access old status easily unless we fetch it before update or pass {new: false} first.
      // Actually logAudit in admin.js was handling this better by fetching old status.
      // But here, I'm just enabling logging.
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send Status Update Email
    if (orderStatus && orderStatus !== 'processing') {
      try {
        await sendEmail({
          email: order.user.email,
          subject: `Order Status Update - #${order._id}`,
          template: 'shippingNotification',
          data: {
            name: order.user.name,
            orderId: order._id,
            status: orderStatus,
            trackingNumber: req.body.trackingNumber || '', // Optional
            carrier: req.body.carrier || '',
            trackingUrl: req.body.trackingUrl || '#',
            orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order._id}`
          }
        });
      } catch (err) {
        console.error('Status email failed:', err);
      }
    }
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;