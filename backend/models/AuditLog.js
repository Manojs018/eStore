const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'PERMISSION_CHANGE', 'OTHER']
    },
    resource: {
        type: String,
        required: true // e.g., 'Product', 'Order', 'User'
    },
    resourceId: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Retention Policy: Index to automatically delete logs after 1 year (31536000 seconds)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Text index for search
auditLogSchema.index({
    'details.name': 'text',
    'details.email': 'text',
    action: 'text',
    resource: 'text'
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
