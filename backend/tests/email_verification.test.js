const request = require('supertest');
const mongoose = require('mongoose');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

// Mock sendEmail
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

const app = require('../server');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

describe('Email Verification', () => {
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
        jest.clearAllMocks();
        await User.deleteMany({});
    });

    it('should send verification email on registration', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Verify User',
                email: 'verify@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain('verify your email');
        expect(sendEmail).toHaveBeenCalledTimes(1);

        // Check if user has verification token
        const user = await User.findOne({ email: 'verify@test.com' });
        expect(user.isEmailVerified).toBe(false);
        expect(user.emailVerificationToken).toBeDefined();
    });

    it('should not login unverified user', async () => {
        // Register
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Unverified User',
                email: 'unverified@test.com',
                password: 'password123'
            });

        // Login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'unverified@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain('verify your email');
    });

    it('should verify email with valid token', async () => {
        // 1. Register to get user in DB
        const resReg = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'To Verify',
                email: 'toverify@test.com',
                password: 'password123'
            });

        // 2. Extract verification link from mock call or directly from DB
        // Since we mock sendEmail, we can't easily extract the link unless we capture the arg
        // But we can get the token from DB if we know the raw token logic (wait, it's hashed in DB)
        // Actually, `getEmailVerificationToken` returns the raw token, and hash is stored.
        // We can't get raw token from DB hash.
        // Solution: We need to spy on `request`? No.
        // We need to look at the argument passed to sendEmail.

        const sendEmailArgs = sendEmail.mock.calls[0][0]; // { email, subject, message }
        const message = sendEmailArgs.message;
        // Extract token from URL: /verifyemail/TOKEN
        const match = message.match(/verifyemail\/([a-f0-9]+)/);
        const token = match[1];

        // 3. Verify
        const res = await request(app).get(`/api/auth/verifyemail/${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined(); // Should return login token

        // 4. Check DB
        const user = await User.findOne({ email: 'toverify@test.com' });
        expect(user.isEmailVerified).toBe(true);
        expect(user.emailVerificationToken).toBeUndefined();

        // 5. Try Login
        const resLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'toverify@test.com',
                password: 'password123'
            });

        expect(resLogin.statusCode).toBe(200);
    });

    it('should resend verification email', async () => {
        // Register
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Resend Test',
                email: 'resend@test.com',
                password: 'password123'
            });

        // Resend
        const res = await request(app)
            .post('/api/auth/resend-verification')
            .send({ email: 'resend@test.com' });

        expect(res.statusCode).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(2); // 1 for register, 1 for resend
    });
});
