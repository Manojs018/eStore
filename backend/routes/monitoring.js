const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const SlowQuery = require('../models/SlowQuery');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Monitoring
 *   description: Database and system monitoring
 */

/**
 * @swagger
 * /api/admin/monitoring/stats:
 *   get:
 *     summary: Get database and system stats
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System stats
 */
router.get('/stats', auth, admin, async (req, res) => {
    try {
        // Database Stats
        const dbStats = await mongoose.connection.db.stats();

        // System Memory
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            percent: ((usedMem / totalMem) * 100).toFixed(1) + '%'
        };

        // Connections
        const connections = {
            current: dbStats.objects, // approximate active objects
            active: await mongoose.connection.db.admin().serverStatus().then(s => s.connections.current),
            available: await mongoose.connection.db.admin().serverStatus().then(s => s.connections.available)
        };

        res.json({
            success: true,
            timestamp: new Date(),
            database: {
                name: dbStats.db,
                collections: dbStats.collections,
                objects: dbStats.objects,
                avgObjSize: dbStats.avgObjSize,
                dataSize: (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
                storageSize: (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
                indexes: dbStats.indexes,
                indexSize: (dbStats.indexSize / 1024 / 1024).toFixed(2) + ' MB',
            },
            system: {
                memory: memoryUsage,
                uptime: os.uptime(),
                loadAvg: os.loadavg()
            },
            connections
        });
    } catch (error) {
        console.error('Monitoring Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

/**
 * @swagger
 * /api/admin/monitoring/slow-queries:
 *   get:
 *     summary: Get slow query logs
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of slow queries
 */
router.get('/slow-queries', auth, admin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const queries = await SlowQuery.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch slow queries' });
    }
});

module.exports = router;
