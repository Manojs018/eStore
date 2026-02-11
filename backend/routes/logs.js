const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/admin/logs
// @desc    Get system logs
// @access  Private/Admin
router.get('/', [auth, admin], (req, res) => {
    try {
        const { date, level, search, limit = 100 } = req.query;

        // Default to today if no date provided
        const dateStr = date || new Date().toISOString().split('T')[0];
        const logFileName = `application-${dateStr}.log`;
        const logFilePath = path.join(__dirname, '../logs', logFileName);

        if (!fs.existsSync(logFilePath)) {
            return res.json({
                success: true,
                data: [],
                message: 'No logs found for this date'
            });
        }

        // Read file
        // Note: For very large files, streaming or tailing is better. 
        // For this implementation, reading the whole file is acceptable but maybe limiting lines.
        const fileContent = fs.readFileSync(logFilePath, 'utf8');

        // Parse lines (each line is a JSON)
        let logs = fileContent
            .split('\n')
            .filter(line => line.trim()) // Remove empty lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null; // Skip malformed lines
                }
            })
            .filter(log => log !== null);

        // Apply filters
        if (level) {
            logs = logs.filter(log => log.level === level);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            logs = logs.filter(log =>
                (log.message && log.message.toLowerCase().includes(searchLower)) ||
                (log.requestId && log.requestId.toLowerCase().includes(searchLower)) ||
                (log.url && log.url.toLowerCase().includes(searchLower))
            );
        }

        // Sort by timestamp descending (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit
        const limitedLogs = logs.slice(0, parseInt(limit));

        res.json({
            success: true,
            count: limitedLogs.length,
            total: logs.length,
            data: limitedLogs
        });

    } catch (error) {
        console.error('Log fetch error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
