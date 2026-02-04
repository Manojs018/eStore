const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Mock email sending
jest.mock('../utils/sendEmail');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Input Validation & Sanitization', () => {
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

    describe('XSS Protection', () => {
        it('should sanitize input body against XSS', async () => {
            // Trying to register with XSS payload in name
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '<script>a</script>J',
                    email: 'xss@test.com',
                    password: 'StrongP@ssw0rd!'
                });

            // Using express-validator .escape() should convert special chars
            // Expecting HTML entities

            expect(res.statusCode).toBe(201);
            // Check for encoded entities
            expect(res.body.data.user.name).toContain('&lt;script&gt;');
            // Should NOT contain raw script tag
            expect(res.body.data.user.name).not.toContain('<script>');
        });
    });

    describe('NoSQL Injection Protection', () => {
        it('should prevent NoSQL injection in login', async () => {
            // Trying to login with operator injection
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: { "$gt": "" }, // Classic MongoDB injection
                    password: 'password123'
                });

            // If sanitized, email becomes empty/safe, user not found -> 401
            // If NOT sanitized, might crash or log in (if valid password for ANY user, though unlikely here)

            expect(res.statusCode).not.toBe(200);
            expect(res.body.success).toBe(false);
        });
    });

});
