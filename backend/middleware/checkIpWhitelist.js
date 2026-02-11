const AllowedIp = require('../models/AllowedIp');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger'); // Assuming logger exists
// Or audit logger

const checkIp = async (req, res, next) => {
    // Check if the route is an admin route
    // The middleware is applied to specific routes, so checking URL might be redundant but safer.
    // However, let's assume this middleware is only applied to routes that need protection.

    // Get client IP
    let clientIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress;

    // Handle multiple IPs in x-forwarded-for
    if (clientIp && clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0].trim();
    }

    // Normalize IPv6 mapped IPv4
    if (clientIp && clientIp.substr(0, 7) === "::ffff:") {
        clientIp = clientIp.substr(7);
    }

    // Always allow localhost for development safety/testing
    if (clientIp === '127.0.0.1' || clientIp === '::1') {
        return next();
    }

    try {
        const allowed = await AllowedIp.findOne({ ip: clientIp, isActive: true });

        if (allowed) {
            return next();
        }

        // Not allowed
        logger.warn(`Unauthorized Admin Access Attempt from IP: ${clientIp}`);

        // Send Alert (email) - Limit frequency ideally
        // For now, fire and forget
        try {
            await sendEmail({
                email: process.env.ADMIN_EMAIL, // Or specific security email
                subject: 'Security Alert: Unauthorized Admin Access Attempt',
                html: `
                    <h2>Unauthorized Access Attempt Blocked</h2>
                    <p><strong>IP Address:</strong> ${clientIp}</p>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Path:</strong> ${req.originalUrl}</p>
                    <p><strong>User Agent:</strong> ${req.headers['user-agent']}</p>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send security alert email', emailErr);
        }

        return res.status(403).json({
            success: false,
            message: 'Access Denied: Your IP is not authorized to access this resource.'
        });

    } catch (error) {
        console.error('IP Check Error:', error);
        // Fail closed for security? or Open for availability?
        // Fail closed usually better for admin security.
        return res.status(500).json({ success: false, message: 'Security Check Failed' });
    }
};

module.exports = checkIp;
