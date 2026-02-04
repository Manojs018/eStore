const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Health Check Endpoints', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    describe('GET /health/live', () => {
        it('should return 200 and available status', async () => {
            const res = await request(app).get('/health/live');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('alive');
        });
    });

    describe('GET /health/ready', () => {
        it('should return 200 when DB is connected', async () => {
            const res = await request(app).get('/health/ready');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('ready');
            expect(res.body.checks.database).toEqual('connected');
        });

        it('should return 503 when DB is disconnected', async () => {
            // Temporarily close connection to simulate failure
            await mongoose.connection.close();

            const res = await request(app).get('/health/ready');
            expect(res.statusCode).toEqual(503);
            expect(res.body.status).toEqual('not ready');

            // Reconnect for subsequent tests
            await mongoose.connect(process.env.MONGO_URI);
        });
    });

    describe('GET /health', () => {
        it('should return detailed health status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('ok');
            expect(res.body.checks.database).toEqual('ok');
            expect(res.body.checks.api).toEqual('ok');
            expect(res.body.checks).toHaveProperty('memoryUsage');
            expect(res.body.checks).toHaveProperty('uptime');
        });
    });
});
