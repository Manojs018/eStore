const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

describe('Logout Functionality', () => {
    let token;
    let user;

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
        await TokenBlacklist.deleteMany({});

        user = await User.create({
            name: 'Logout Test',
            email: 'logout@test.com',
            password: 'password123',
            role: 'user'
        });

        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should logout user and blacklist token', async () => {
        // 1. Verify token works initially
        const profileRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(profileRes.statusCode).toBe(200);

        // 2. Perform logout
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(logoutRes.statusCode).toBe(200);
        expect(logoutRes.body.success).toBe(true);
        expect(logoutRes.body.message).toBe('Logged out successfully');

        // 3. Verify token is now blacklisted
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        expect(blacklistedToken).toBeTruthy();

        // 4. Verify token no longer works
        const profileResAfterLogout = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(profileResAfterLogout.statusCode).toBe(401);
        expect(profileResAfterLogout.body.message).toContain('Blacklisted');
    });

    it('should not allow logout without token', async () => {
        const res = await request(app)
            .post('/api/auth/logout');

        expect(res.statusCode).toBe(401);
    });
});
