
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Mock rate limiter to avoid 429 errors during tests
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('CORS Configuration', () => {
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

    it('should allow requests from whitelisted origin (localhost:3000)', async () => {
        const res = await request(app)
            .get('/health')
            .set('Origin', 'http://localhost:3000');

        expect(res.statusCode).toEqual(200);
        expect(res.headers['access-control-allow-origin']).toEqual('http://localhost:3000');
        expect(res.headers['access-control-allow-credentials']).toEqual('true');
    });

    it('should allow requests with no origin (e.g. server-to-server or Curl)', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        // Standard CORS middleware usually doesn't send CORS headers if origin is missing, but request passes
    });

    it('should block requests from unauthorized origin', async () => {
        const res = await request(app)
            .get('/health')
            .set('Origin', 'http://evil-site.com');

        // CORS middleware by default returns 500 when origin callback returns error
        expect(res.statusCode).toEqual(500);
        expect(res.text).toContain('Not allowed by CORS');
    });

    it('should allow OPTIONS preflight request from whitelisted origin', async () => {
        const res = await request(app)
            .options('/api/products')
            .set('Origin', 'http://localhost:3000')
            .set('Access-Control-Request-Method', 'POST');

        expect(res.statusCode).toEqual(204); // No Content
        expect(res.headers['access-control-allow-methods']).toContain('POST');
        expect(res.headers['access-control-allow-origin']).toEqual('http://localhost:3000');
    });
});
