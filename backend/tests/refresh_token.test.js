const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const TokenBlacklist = require('../models/TokenBlacklist');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Refresh Token Functionality', () => {
    let user;
    let refreshToken;

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

    beforeEach(async () => {
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
        await TokenBlacklist.deleteMany({});

        user = await User.create({
            name: 'Refresh Test',
            email: 'refresh@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'user',
            isEmailVerified: true
        });
    });

    it('should return refresh token on login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'refresh@test.com',
                password: 'StrongP@ssw0rd!'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('refreshToken');
        expect(res.body.data).toHaveProperty('token');

        // Save for next tests
        refreshToken = res.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
        // 1. Login first to get a token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'refresh@test.com',
                password: 'StrongP@ssw0rd!'
            });

        const validRefreshToken = loginRes.body.data.refreshToken;

        // 2. Use refresh token
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: validRefreshToken });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('refreshToken');
        expect(res.body.data.refreshToken).not.toBe(validRefreshToken); // Rotation check
    });

    it('should reject invalid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'invalid_token_123' });

        expect(res.statusCode).toBe(400);
    });

    it('should reject expired refresh token', async () => {
        // Create an expired token manually
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 1);

        const expiredToken = await RefreshToken.create({
            user: user._id,
            token: 'expired_test_token',
            expires: expiredDate,
            createdByIp: '127.0.0.1'
        });

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: expiredToken.token });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('expired');
    });

    it('should reject revoked refresh token', async () => {
        // 1. Login first
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'refresh@test.com',
                password: 'StrongP@ssw0rd!'
            });

        const validRefreshToken = loginRes.body.data.refreshToken;

        // 2. Refresh once (this should revoke the first one)
        await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: validRefreshToken });

        // 3. Try access with the old (now revoked) token
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: validRefreshToken });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('revoked');
    });
});
