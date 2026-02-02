const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth, admin } = require('../middleware/auth');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

// Helper function for audit logging
const createAuditLog = async (adminId, action, targetResource, targetId, details) => {
    try {
        await AuditLog.create({
            admin: adminId,
            action,
            targetResource,
            targetId,
            details
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Private/Admin
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

// @route   GET /api/admin/revenue
// @desc    Get revenue data
// @access  Private/Admin
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

        await createAuditLog(req.user._id, 'UPDATE_ROLE', 'User', user._id, {
            previous: previousRole,
            new: role
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

        await createAuditLog(req.user._id, 'CREATE_PRODUCT', 'Product', product._id, {
            name: product.name
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

        await createAuditLog(req.user._id, 'UPDATE_PRODUCT', 'Product', product._id, req.body);

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
router.delete('/products/:id', [auth, admin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || product.isDeleted) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isDeleted = true;
        await product.save();

        await createAuditLog(req.user._id, 'DELETE_PRODUCT', 'Product', product._id, {
            name: product.name
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

        await createAuditLog(req.user._id, 'UPDATE_ORDER_STATUS', 'Order', order._id, {
            previous: previousStatus,
            new: status
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
