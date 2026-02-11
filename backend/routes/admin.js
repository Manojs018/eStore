const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth, admin } = require('../middleware/auth');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

// Helper function for audit logging
// Using centralized audit logger now
const logAudit = require('../utils/auditLogger');

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats
 *       403:
 *         description: Forbidden
 */
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalOrders = await Order.countDocuments({ isDeleted: false });

        const revenueData = await Order.aggregate([
            { $match: { isDeleted: false, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
// Actually, I should just wrap the comments.
// Let's retry with a safer replacement that keeps the function signature but doesn't include the body in the replacement if I can.
// But the replace tool requires valid start/end lines.

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Get revenue statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data
 */
router.get('/revenue', [auth, admin], async (req, res) => {
    try {
        // Get revenue grouped by day for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueByDate = await Order.aggregate([
            {
                $match: {
                    isDeleted: false,
                    paymentStatus: 'paid',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    amount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: revenueByDate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Change user role
 *     tags: [Admin]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role', [auth, admin], async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const previousRole = user.role;
        user.role = role;
        await user.save();

        await logAudit({
            userId: req.user._id,
            action: 'UPDATE_ROLE', // Updated action name for consistency
            resource: 'User',
            resourceId: user._id,
            details: {
                previous: previousRole,
                new: role
            },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/admin/products
// @desc    Create product
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post('/products', [
    auth,
    admin,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price is required and must be positive').isFloat({ min: 0 }),
        check('category', 'Category is required').not().isEmpty(),
        check('stock', 'Stock is required').isInt({ min: 0 })
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const product = await Product.create(req.body);

        await logAudit({
            userId: req.user._id,
            action: 'CREATE',
            resource: 'Product',
            resourceId: product._id,
            details: { name: product.name },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', [auth, admin], async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product || product.isDeleted) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        await logAudit({
            userId: req.user._id,
            action: 'UPDATE',
            resource: 'Product',
            resourceId: product._id,
            details: req.body,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/products/:id
// @desc    Soft delete product
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Soft delete product
 *     tags: [Admin]
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
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', [auth, admin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || product.isDeleted) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isDeleted = true;
        await product.save();

        await logAudit({
            userId: req.user._id,
            action: 'DELETE',
            resource: 'Product',
            resourceId: product._id,
            details: { name: product.name },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/orders', [auth, admin], async (req, res) => {
    try {
        const orders = await Order.find({ isDeleted: false })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order status
// @access  Private/Admin
/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id', [auth, admin], async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order || order.isDeleted) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const previousStatus = order.orderStatus;
        order.orderStatus = status;

        // Add to history
        order.statusHistory.push({
            status,
            date: Date.now(),
            comment: `Status updated to ${status} by admin`
        });

        await order.save();

        await logAudit({
            userId: req.user._id,
            action: 'UPDATE_STATUS', // Using custom action for order status
            resource: 'Order',
            resourceId: order._id,
            details: {
                previous: previousStatus,
                new: status
            },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
