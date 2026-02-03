const crypto = require('crypto');

const requestId = (req, res, next) => {
    // Use existing ID if provided, otherwise generate one
    req.id = req.headers['x-request-id'] || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));
    // Set response header
    res.setHeader('X-Request-Id', req.id);
    next();
};

module.exports = requestId;
