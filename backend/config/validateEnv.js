const logger = require('../utils/logger');

const validateEnv = () => {
    const required = [
        'MONGO_URI',
        'JWT_SECRET'
    ];

    const recommended = [
        'STRIPE_SECRET_KEY',
        'SMTP_EMAIL',
        'SMTP_PASSWORD'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        const message = `FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`;
        console.error(message); // Ensure visibility in console
        if (logger) logger.error(message);
        process.exit(1);
    }

    const missingRecommended = recommended.filter(key => !process.env[key]);
    if (missingRecommended.length > 0) {
        const message = `WARNING: Missing recommended environment variables: ${missingRecommended.join(', ')}`;
        if (logger) logger.warn(message);
    }
};

module.exports = validateEnv;
