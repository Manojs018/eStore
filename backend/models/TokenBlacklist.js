const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically expire documents after 30 days (matching JWT expire approx)
    }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
