const AllowedIp = require('../models/AllowedIp');
const { auth, admin } = require('../middleware/auth');
const logAudit = require('../utils/auditLogger');
const router = require('express').Router();

// @route   GET /api/admin/allowed-ips
// @desc    Get all allowed IPs
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
    try {
        const ips = await AllowedIp.find().sort({ createdAt: -1 }).populate('addedBy', 'name email');
        res.json({ success: true, data: ips });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/admin/allowed-ips
// @desc    Add allowed IP
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { ip, label } = req.body;

        if (!ip) {
            return res.status(400).json({ success: false, message: 'IP Address is required' });
        }

        const existing = await AllowedIp.findOne({ ip });
        if (existing) {
            return res.status(400).json({ success: false, message: 'IP already whitelisted' });
        }

        // IP Validation (simple regex or library)
        // Could use 'ip' package but regex is fine for now
        // ipv4 or ipv6
        // Simplistic check for now

        const newIp = await AllowedIp.create({
            ip,
            label,
            addedBy: req.user._id
        });

        logAudit({
            userId: req.user._id,
            action: 'CREATE',
            resource: 'AllowedIp',
            resourceId: newIp._id,
            details: { ip: newIp.ip, label: newIp.label },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({ success: true, data: newIp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/allowed-ips/:id
// @desc    Remove allowed IP
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const allowedIp = await AllowedIp.findById(req.params.id);

        if (!allowedIp) {
            return res.status(404).json({ success: false, message: 'IP not found' });
        }

        // Prevent deleting current IP to avoid lockout?
        // Maybe warn but allow. 
        // Or check if current request IP matches allowedIp.ip
        const currentIp = req.ip || req.connection.remoteAddress;
        if (req.query.force !== 'true' && (allowedIp.ip === currentIp || allowedIp.ip === '127.0.0.1' || allowedIp.ip === '::1')) {
            // allow strict local, but warn
        }

        await AllowedIp.deleteOne({ _id: req.params.id });

        logAudit({
            userId: req.user._id,
            action: 'DELETE',
            resource: 'AllowedIp',
            resourceId: allowedIp._id,
            details: { ip: allowedIp.ip },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: 'IP removed from whitelist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
