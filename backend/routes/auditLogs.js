const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/audit-logs
// @desc    Get audit logs with filtering and pagination
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            action,
            resource,
            user,
            startDate,
            endDate,
            search
        } = req.query;

        const query = {};

        // Filters
        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (user) query.user = user;

        // Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Search (using text index)
        if (search) {
            query.$text = { $search: search };
        }

        const logs = await AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 }) // Newest first
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Audit Log Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
