const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Log the incoming request
    const start = Date.now();

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            message: 'Incoming Request',
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration,
            requestId: req.id
        };

        if (res.statusCode >= 500) {
            logger.error({ ...logData, message: 'Request Error' });
        } else if (res.statusCode >= 400) {
            logger.warn({ ...logData, message: 'Request Warning' });
        } else {
            logger.info(logData);
        }
    });


    next();
};

module.exports = requestLogger;
