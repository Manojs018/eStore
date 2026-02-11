const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    eventType: {
        type: String, // 'pageview', 'add_to_cart', 'checkout_start', 'purchase', 'view_item'
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    guestId: {
        type: String, // Fingerprint or session ID for unauthenticated users
        index: true
    },
    url: String,
    metadata: {
        productId: String,
        productName: String,
        value: Number,
        currency: String,
        referrer: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
