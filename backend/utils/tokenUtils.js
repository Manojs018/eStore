const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// Generate Refresh Token
const generateRefreshToken = async (user, ipAddress) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const refreshToken = await RefreshToken.create({
        user: user._id,
        token,
        expires,
        createdByIp: ipAddress
    });

    return refreshToken;
};

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '15m' // Short lived access token
    });
};

module.exports = { generateRefreshToken, generateAccessToken };
