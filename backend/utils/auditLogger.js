const AuditLog = require('../models/AuditLog');

const logAudit = async ({
    userId,
    action,
    resource,
    resourceId,
    details = {},
    ip,
    userAgent
}) => {
    try {
        const log = new AuditLog({
            user: userId,
            action,
            resource, // e.g., 'User', 'Product'
            resourceId,
            details,
            ip,
            userAgent
        });

        await log.save();
    } catch (err) {
        console.error('Failed to create audit log:', err);
        // Don't throw - audit logging should not break the main operation
    }
};

module.exports = logAudit;
