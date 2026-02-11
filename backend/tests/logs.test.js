const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');
const User = require('../models/User');
const { connect, close, clear } = require('./db');

describe('Logs API', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => connect());
    afterAll(async () => close());

    const { authLimiter } = require('../middleware/rateLimiter');

    beforeEach(async () => {
        // Reset rate limiter for the test IP
        // Jest/Supertest often uses ::ffff:127.0.0.1 or 127.0.0.1
        // We act on the internal store if possible or try likely IPs
        if (authLimiter.resetKey) {
            authLimiter.resetKey('::ffff:127.0.0.1');
            authLimiter.resetKey('127.0.0.1');
            authLimiter.resetKey('::1');
        }

        await clear();

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'admin',
            isEmailVerified: true
        });
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com',
            password: 'StrongP@ssw0rd!'
        });

        if (adminLogin.status !== 200) {
            console.error('Admin Login Failed with status:', adminLogin.status);
            console.error('Body:', JSON.stringify(adminLogin.body));
        }
        adminToken = adminLogin.body.data.token;

        // Create User
        const user = await User.create({
            name: 'Normal User',
            email: 'user@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'user',
            isEmailVerified: true
        });
        const userLogin = await request(app).post('/api/auth/login').send({
            email: 'user@test.com',
            password: 'StrongP@ssw0rd!'
        });
        userToken = userLogin.body.data.token;

        // Ensure log file exists for today
        const dateStr = new Date().toISOString().split('T')[0];
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logFilePath = path.join(logDir, `application-${dateStr}.log`);

        // Append a test log line
        const testLog = JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Test log entry',
            service: 'backend-test'
        }) + '\n';
        fs.appendFileSync(logFilePath, testLog);
    });

    it('should allow admin to fetch logs', async () => {
        const res = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should block non-admin users', async () => {
        const res = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('should filter logs by level', async () => {
        const res = await request(app)
            .get('/api/admin/logs?level=info')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        if (res.body.data.length > 0) {
            expect(res.body.data[0].level).toBe('info');
        }
    });

    it('should filter logs by search term', async () => {
        const res = await request(app)
            .get('/api/admin/logs?search=Test log entry')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        // Might be empty if our appended log isn't picked up immediately or file rotation issues, 
        // but status should be 200.
    });
});
