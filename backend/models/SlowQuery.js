const mongoose = require('mongoose');

const slowQuerySchema = new mongoose.Schema({
    collectionName: {
        type: String,
        required: true
    },
    operation: {
        type: String, // find, update, etc.
        required: true
    },
    query: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    duration: { // in milliseconds
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 604800 // Automatically delete after 7 days
    }
});

module.exports = mongoose.model('SlowQuery', slowQuerySchema);
