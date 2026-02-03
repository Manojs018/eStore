const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Security Headers', () => {
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

    it('should have security headers', async () => {
        const res = await request(app).get('/health');

        expect(res.statusCode).toBe(200);

        // Check for Helmet headers
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN'); // Default helmet is SAMEORIGIN usually or it might be not present if upgraded. Let's check common ones.
        expect(res.headers['strict-transport-security']).toBeDefined();
        expect(res.headers['x-download-options']).toBe('noopen');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-xss-protection']).toBe('0'); // Helmet disables it because it's deprecated and buggy
        expect(res.headers['content-security-policy']).toBeDefined();
    });
});
