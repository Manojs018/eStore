const cron = require('node-cron');
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// Alert Thresholds
const MEMORY_THRESHOLD_PERCENT = 90;
const STORAGE_THRESHOLD_MB = 1024 * 5; // 5 GB (Example limit)

const checkSystemHealth = async () => {
    try {
        // Check Memory
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = (usedMem / totalMem) * 100;

        if (memUsagePercent > MEMORY_THRESHOLD_PERCENT) {
            const message = `High Memory Usage Detected: ${memUsagePercent.toFixed(2)}%`;
            logger.warn(message);
            await sendAlert('High Memory Usage Alert', message);
        }

        // Check Database Connection
        if (mongoose.connection.readyState !== 1) {
            const message = `Database Connection Lost. State: ${mongoose.connection.readyState}`;
            logger.error(message);
            await sendAlert('Database Connectivity Alert', message);
            return; // Can't check DB stats if not connected
        }

        // Check DB Storage (if quotas exist, simulating check here)
        const dbStats = await mongoose.connection.db.stats();
        const storageSizeMB = dbStats.storageSize / 1024 / 1024;

        if (storageSizeMB > STORAGE_THRESHOLD_MB) {
            const message = `Database Storage Warning: ${storageSizeMB.toFixed(2)} MB used.`;
            logger.warn(message);
            await sendAlert('Database Storage Alert', message);
        }

        logger.info('System health check passed', {
            memUsage: memUsagePercent.toFixed(2) + '%',
            dbSize: storageSizeMB.toFixed(2) + 'MB'
        });

    } catch (error) {
        logger.error('Health check failed', error);
    }
};

const sendAlert = async (subject, message) => {
    try {
        if (!process.env.ADMIN_EMAIL) return;

        await sendEmail({
            email: process.env.ADMIN_EMAIL,
            subject: `[SYSTEM ALERT] ${subject}`,
            html: `<h3>${subject}</h3><p>${message}</p><p>Time: ${new Date().toISOString()}</p>`
        });
    } catch (e) {
        logger.error('Failed to send email alert', e);
    }
};

// Run cron every 5 minutes
const startMonitoring = () => {
    cron.schedule('*/5 * * * *', checkSystemHealth);
    logger.info('System monitoring cron started');
};

module.exports = startMonitoring;
