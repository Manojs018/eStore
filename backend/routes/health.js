const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Liveness Check (Is app process running?)
// @route   GET /health/live
// @access  Public
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});

// @desc    Readiness Check (Are dependencies ready?)
// @route   GET /health/ready
// @access  Public
router.get('/ready', (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (dbState === 1) {
        res.status(200).json({
            status: 'ready',
            checks: {
                database: 'connected'
            },
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(503).json({
            status: 'not ready',
            checks: {
                database: 'disconnected'
            },
            timestamp: new Date().toISOString()
        });
    }
});

// @desc    Detailed Health Check
// @route   GET /health
// @access  Public
router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'ok' : 'error';
    const httpStatus = dbState === 1 ? 200 : 503;

    res.status(httpStatus).json({
        status: dbState === 1 ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        checks: {
            database: dbStatus,
            api: 'ok',
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        }
    });
});

module.exports = router;
