const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Application health status
 */

// @desc    Liveness Check (Is app process running?)
// @route   GET /health/live
// @access  Public
/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness Probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});

// @desc    Readiness Check (Are dependencies ready?)
// @route   GET /health/ready
// @access  Public
/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness Probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application dependencies are ready
 *       503:
 *         description: Application is not ready (e.g. database disconnected)
 */
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
