const mongoose = require('mongoose');

const allowedIpSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    label: {
        type: String,
        trim: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AllowedIp', allowedIpSchema);
