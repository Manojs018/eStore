const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Log the incoming request
    const start = Date.now();

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const reqIdPart = req.id ? `[Req: ${req.id}] ` : '';
        const message = `${reqIdPart}${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    });

    next();
};

module.exports = requestLogger;
