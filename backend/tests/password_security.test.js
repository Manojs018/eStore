const request = require('supertest');
const mongoose = require('mongoose');

// Mock rate limiter & sendEmail
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

const app = require('../server');
const User = require('../models/User');

describe('Password Security', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should reject weak passwords (< 8 chars)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Weak User',
                email: 'weak@test.com',
                password: 'Pass1!' // 6 chars
            });
        expect(res.statusCode).toBe(400);
        expect(JSON.stringify(res.body)).toContain('at least 8 characters');
    });

    it('should reject passwords without uppercase', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Weak User',
                email: 'upper@test.com',
                password: 'password1!'
            });
        expect(res.statusCode).toBe(400);
        expect(JSON.stringify(res.body)).toContain('uppercase');
    });

    it('should reject common passwords', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Common User',
                email: 'common@test.com',
                password: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(JSON.stringify(res.body)).toContain('Common passwords');
    });

    it('should allow strong passwords', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Strong User',
                email: 'strong@test.com',
                password: 'StrongPassword1!@'
            });
        expect(res.statusCode).toBe(201);
    });
});
