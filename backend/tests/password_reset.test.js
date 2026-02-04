const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = require('../server');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Mock nodemailer
jest.mock('../utils/sendEmail');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Password Reset Flow', () => {
    let user;
    let resetToken;

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

        // Create a user
        user = await User.create({
            name: 'Reset Test',
            email: 'reset@test.com',
            password: 'StrongP@ssw0rd!',
            isEmailVerified: true
        });

        // Clear mock
        sendEmail.mockClear();
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should send email with reset token for registered user', async () => {
            sendEmail.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'reset@test.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('Email sent');
            expect(sendEmail).toHaveBeenCalledTimes(1);
        });

        it('should return success even if email does not exist (security)', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@test.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('Email sent');
            // Should NOT call sendEmail for security reasons (or implementation choice)
            // In our implementation, we return early, so no email is sent.
            expect(sendEmail).not.toHaveBeenCalled();
        });
    });

    describe('PUT /api/auth/reset-password/:token', () => {
        beforeEach(async () => {
            // Generate a valid token for the user manually
            resetToken = user.getResetPasswordToken();
            await user.save({ validateBeforeSave: false });
        });

        it('should reset password with valid token', async () => {
            const res = await request(app)
                .put(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'StrongP@ssw0rd!123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');

            // Verify login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'reset@test.com',
                    password: 'StrongP@ssw0rd!123'
                });

            expect(loginRes.statusCode).toBe(200);
        });

        it('should not reset password with invalid token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/invalidtoken')
                .send({ password: 'StrongP@ssw0rd!123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should not reset password with expired token', async () => {
            // Manually modify the user to have an expired token
            const hashedToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            await User.findByIdAndUpdate(user._id, {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: Date.now() - 1000 // Expired 1 second ago
            });

            const res = await request(app)
                .put(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'StrongP@ssw0rd!123' });

            expect(res.statusCode).toBe(400);
        });
    });
});
