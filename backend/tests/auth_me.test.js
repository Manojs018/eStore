const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');

describe('Auth "Me" Endpoint', () => {
    let token;
    let user;

    beforeAll(async () => {
        // Connect to specific test db to avoid conflicts
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});

        user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
        });

        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    describe('GET /api/auth/me', () => {
        it('should return user profile when authenticated', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.name).toBe('John Doe');
            expect(res.body.data.email).toBe('john@example.com');
            expect(res.body.data.role).toBe('user');
            expect(res.body.data.password).toBeUndefined(); // Ensure password is excluded
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toEqual(401);
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.statusCode).toEqual(401); // Or 500 depending on how middleware handles it, but ideally 401
        });
    });
});
