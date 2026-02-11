const rateLimit = require('express-rate-limit');

// General API limiter (100 reqs / 15 mins)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true, // Enable for testing
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// Auth limiter (5 reqs / 15 mins) - Stricter for login/register
// Auth limiter (5 reqs / 15 mins) - Stricter for login/register
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    standardHeaders: true,
    legacyHeaders: true, // Enable for testing
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    }
});

// Search limiter (50 reqs / 15 mins)
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: true, // Enable for testing
    message: {
        success: false,
        message: 'Too many search requests, please try again later.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    searchLimiter
};
