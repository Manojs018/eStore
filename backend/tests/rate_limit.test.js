const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Rate Limiting', () => {
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

    it('should limit auth requests', async () => {
        // Auth limit is 5. We send 6.
        for (let i = 0; i < 5; i++) {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrong' });
            // Depending on rate limiter reset, might be 401 or whatever, generally 401 until limit hit
        }

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrong' });

        expect(res.statusCode).toBe(429);
        expect(res.body.message).toContain('Too many login attempts');
    });

    it('should limit product search requests', async () => {
        // Search limit is 50.
        // It's hard to test 50 requests in a short time in integration test without slow down
        // But we check if headers are present
        const res = await request(app).get('/api/products');

        expect(res.statusCode).toBe(200);
        expect(res.headers['x-ratelimit-limit']).toBe('50');
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should apply global api limit', async () => {
        const res = await request(app).get('/api/products/123');
        // Global limit is 100
        // Search limiter was also applied to products so it overrides or stacks? 
        // Express rate limit stacks if used multiple times on same route? 
        // Actually, we applied searchLimiter specifically to GET / and GET /filter on products.
        // apiLimiter is applied to /api/ globally.
        // So /api/products will hit BOTH apiLimiter AND searchLimiter.

        expect(res.headers['x-ratelimit-limit']).toBeDefined();
    });
});
