const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const { connect, close, clear } = require('../tests/db');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Admin API Endpoints', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testProduct;
    let testOrder;

    beforeAll(async () => connect());
    afterAll(async () => close());
    beforeEach(async () => clear());

    // Cleanup
    beforeEach(async () => {
        // Create Admin User
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'admin',
            isEmailVerified: true
        });

        adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create Regular User
        regularUser = await User.create({
            name: 'Regular User',
            email: 'user@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'user',
            isEmailVerified: true
        });

        userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create Test Product
        testProduct = await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            category: 'electronics',
            stock: 10
        });

        // Create Test Order
        testOrder = await Order.create({
            user: regularUser._id,
            items: [{
                product: testProduct._id,
                name: testProduct.name,
                price: testProduct.price,
                quantity: 1
            }],
            totalAmount: 100,
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            paymentIntentId: 'pi_test_123'
        });
    });



    describe('Authentication & Authorization', () => {
        it('should deny access without token', async () => {
            const res = await request(app).get('/api/admin/stats');
            expect(res.statusCode).toEqual(401);
        });

        it('should deny access for non-admin user', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(403);
        });

        it('should allow access for admin user', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('Stats API', () => {
        it('should return correct stats', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalUsers).toBeDefined();
            expect(res.body.data.totalProducts).toBeDefined();
            expect(res.body.data.totalOrders).toBeDefined();
            expect(res.body.data.totalRevenue).toBeDefined();
        });
    });

    describe('Product Management', () => {
        let createdProductId;

        it('should create a new product', async () => {
            const res = await request(app)
                .post('/api/admin/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Admin Product',
                    description: 'Created by admin',
                    price: 50,
                    category: 'tools',
                    stock: 20
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.name).toBe('New Admin Product');
            createdProductId = res.body.data._id;

            // Verify Audit Log
            const log = await AuditLog.findOne({
                action: 'CREATE_PRODUCT',
                targetId: createdProductId
            });
            expect(log).toBeTruthy();
        });

        it('should update a product', async () => {
            const res = await request(app)
                .put(`/api/admin/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    price: 150
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.price).toBe(150);

            // Verify Audit Log
            const log = await AuditLog.findOne({
                action: 'UPDATE_PRODUCT',
                targetId: testProduct._id
            });
            expect(log).toBeTruthy();
        });

        it('should soft delete a product', async () => {
            const res = await request(app)
                .delete(`/api/admin/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const product = await Product.findById(testProduct._id);
            expect(product.isDeleted).toBe(true);

            // Verify Audit Log
            const log = await AuditLog.findOne({
                action: 'DELETE_PRODUCT',
                targetId: testProduct._id
            });
            expect(log).toBeTruthy();
        });
    });

    describe('Order Management', () => {
        it('should get all orders', async () => {
            const res = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should update order status', async () => {
            const res = await request(app)
                .put(`/api/admin/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'shipped'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.orderStatus).toBe('shipped');
            expect(res.body.data.statusHistory.length).toBeGreaterThan(0);

            // Verify Audit Log
            const log = await AuditLog.findOne({
                action: 'UPDATE_ORDER_STATUS',
                targetId: testOrder._id
            });
            expect(log).toBeTruthy();
        });
    });

    describe('User Management', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should change user role', async () => {
            const res = await request(app)
                .put(`/api/admin/users/${regularUser._id}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role: 'admin' // Promote user to admin
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.role).toBe('admin');

            // Verify Audit Log
            const log = await AuditLog.findOne({
                action: 'UPDATE_ROLE',
                targetId: regularUser._id
            });
            expect(log).toBeTruthy();
        });
    });
});
