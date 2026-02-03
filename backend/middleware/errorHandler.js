const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    // Ensure message is copied from prototype
    error.message = err.message;

    // Log the error with Request ID context
    const reqIdInfo = req.id ? `[Req: ${req.id}]` : '';
    logger.error(`${reqIdInfo} Error: ${err.message}`);

    if (err.stack) {
        // Create a separate log for stack trace to keep main log clean or include it
        // logger.error already handles stack if passed as object but here we passed message string
        // Let's log formatted stack
        logger.error(`${reqIdInfo} Stack: ${err.stack}`);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404, 'RESOURCE_NOT_FOUND');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400, 'DUPLICATE_VALUE');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400, 'VALIDATION_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new ErrorResponse(message, 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new ErrorResponse(message, 401, 'TOKEN_EXPIRED');
    }

    // Send response
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            code: error.errorCode || 'SERVER_ERROR',
            message: error.message || 'Server Error',
            requestId: req.id
        },
        // Only include stack in development
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};

module.exports = errorHandler;
