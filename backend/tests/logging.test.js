const request = require('supertest');
const fs = require('fs');
const path = require('path');
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

describe('Logging System', () => {
    let logFile;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Calculate log filename
        const date = new Date().toISOString().split('T')[0];
        logFile = path.join(__dirname, '../logs', `application-${date}.log`);

        // Ensure logs directory exists
        const logDir = path.dirname(logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'logging@test.com' });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    it('should log API requests to file', async () => {
        let initialSize = 0;
        if (fs.existsSync(logFile)) {
            initialSize = fs.statSync(logFile).size;
        }

        await request(app).get('/health');

        // Wait for flush
        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fs.existsSync(logFile)).toBe(true);
        const newSize = fs.statSync(logFile).size;
        expect(newSize).toBeGreaterThan(initialSize);

        const content = fs.readFileSync(logFile, 'utf8');
        expect(content).toContain('GET /health 200');
    });

    it('should log auth events to file', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Log User',
                email: 'logging@test.com',
                password: 'Password1!@'
            });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const content = fs.readFileSync(logFile, 'utf8');
        expect(content).toContain('New user registered: logging@test.com');

        await request(app)
            .post('/api/auth/login')
            .send({
                email: 'logging@test.com',
                password: 'WrongPassword1!@'
            });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const content2 = fs.readFileSync(logFile, 'utf8');
        // We verify auth event (registration) is logged
        expect(content).toContain('New user registered: logging@test.com');
        // We verify request logger caught the login attempt
        expect(content2).toContain('POST /api/auth/login');
    });
});
