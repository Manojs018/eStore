const SlowQuery = require('../models/SlowQuery');
const logger = require('../utils/logger');

const SLOW_QUERY_THRESHOLD = 100; // ms

function performanceMonitor(schema) {
    // Pre-hook for find operations
    const ops = ['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'];

    ops.forEach(op => {
        schema.pre(op, function (next) {
            this._startTime = Date.now();
            next();
        });

        schema.post(op, function (docs, next) {
            if (this._startTime) {
                const duration = Date.now() - this._startTime;
                if (duration > SLOW_QUERY_THRESHOLD) {
                    const queryMeta = {
                        collectionName: this.model.collection.name,
                        operation: op,
                        query: this.getFilter ? this.getFilter() : {}, // some ops like aggregate might not have getFilter
                        duration
                    };

                    // Log and store
                    logger.warn(`Slow Query detected: ${duration}ms`, queryMeta);

                    try {
                        SlowQuery.create(queryMeta).catch(err => logger.error('Failed to log slow query to DB', err));
                    } catch (e) {
                        // ensure logging doesn't crash app
                        logger.error('Error logging slow query', e);
                    }
                }
            }
            next();
        });
    });
}

module.exports = performanceMonitor;
