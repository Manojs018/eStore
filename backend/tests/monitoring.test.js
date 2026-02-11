const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const { connect, close, clear } = require('./db');
const SlowQuery = require('../models/SlowQuery');

const adminUser = {
    name: 'Admin User',
    email: 'admin@monitor.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true
};

const regularUser = {
    name: 'Regular User',
    email: 'user@monitor.com',
    password: 'password123',
    role: 'user',
    isEmailVerified: true
};

let adminToken;
let userToken;

describe('Monitoring API', () => {
    beforeAll(async () => await connect());
    afterAll(async () => await close());

    beforeEach(async () => {
        await clear();

        // Create Users
        await User.create(adminUser);
        await User.create(regularUser);

        // Login Admin
        const adminRes = await request(app).post('/api/auth/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = adminRes.body.data.token;

        // Login User
        const userRes = await request(app).post('/api/auth/login').send({
            email: regularUser.email,
            password: regularUser.password
        });
        userToken = userRes.body.data.token;
    });

    it('should return system stats for admin', async () => {
        const res = await request(app)
            .get('/api/admin/monitoring/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.database).toBeDefined();
        expect(res.body.system).toBeDefined();
        expect(res.body.connections).toBeDefined();
        expect(res.body.system.memory).toBeDefined();
    });

    it('should block non-admin from accessing stats', async () => {
        const res = await request(app)
            .get('/api/admin/monitoring/stats')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('should fetch slow queries', async () => {
        // Seed a slow query
        await SlowQuery.create({
            collectionName: 'products',
            operation: 'find',
            duration: 500,
            query: { price: { $gt: 100 } }
        });

        const res = await request(app)
            .get('/api/admin/monitoring/slow-queries')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].operation).toBe('find');
    });
});
