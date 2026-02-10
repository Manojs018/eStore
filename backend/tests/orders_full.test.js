const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { connect, close, clear } = require('./db');

// Mock Rate Limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn(() => ({
        paymentIntents: {
            create: jest.fn().mockResolvedValue({
                id: 'pi_mock_123',
                client_secret: 'pi_mock_secret_123',
                status: 'requires_payment_method'
            }),
            retrieve: jest.fn().mockResolvedValue({
                id: 'pi_mock_123',
                status: 'succeeded',
                amount: 1000,
                currency: 'usd'
            })
        }
    }));
});

// Mock Nodemailer
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

describe('Orders API Comprehensive', () => {
    let userToken;
    let adminToken;
    let userId;
    let product;

    beforeAll(async () => connect());
    afterAll(async () => close());
    beforeEach(async () => {
        await clear();

        // Create User
        const user = await User.create({
            name: 'Order User',
            email: 'order@test.com',
            password: 'StrongP@ssw0rd!',
            isEmailVerified: true
        });
        userId = user._id;
        userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'StrongP@ssw0rd!',
            role: 'admin',
            isEmailVerified: true
        });
        adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

        // Create Product
        product = await Product.create({
            name: 'Test Product',
            description: 'Desc',
            price: 10,
            category: 'electronics',
            stock: 100
        });
    });

    describe('POST /api/orders/create-payment-intent', () => {
        it('should create payment intent', async () => {
            const res = await request(app)
                .post('/api/orders/create-payment-intent')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    items: [{ productId: product._id, quantity: 2 }],
                    shippingAddress: {
                        street: '123 St',
                        city: 'City',
                        state: 'ST',
                        zipCode: '12345'
                    }
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('clientSecret');
            expect(res.body.data).toHaveProperty('paymentIntentId');
        });

        it('should return 400 for insufficient stock', async () => {
            const res = await request(app)
                .post('/api/orders/create-payment-intent')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    items: [{ productId: product._id, quantity: 200 }], // Exceeds 100
                    shippingAddress: { street: '123 St', city: 'City', state: 'ST', zipCode: '12345' }
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Insufficient stock');
        });
    });

    describe('POST /api/orders/confirm-payment', () => {
        it('should confirm order creation', async () => {
            const res = await request(app)
                .post('/api/orders/confirm-payment')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    paymentIntentId: 'pi_mock_123',
                    items: [{ productId: product._id, quantity: 1 }],
                    shippingAddress: {
                        street: '123 St',
                        city: 'City',
                        state: 'ST',
                        zipCode: '12345'
                    }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.orderStatus).toBe('processing');

            // Verify stock reduction
            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.stock).toBe(99);
        });

        it('should return 400 if order already exists', async () => {
            // Create duplicates
            await Order.create({
                user: userId,
                items: [],
                totalAmount: 10,
                paymentIntentId: 'pi_mock_123', // Same ID
                shippingAddress: {
                    street: '123 St',
                    city: 'City',
                    state: 'ST',
                    zipCode: '12345'
                }
            });

            const res = await request(app)
                .post('/api/orders/confirm-payment')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    paymentIntentId: 'pi_mock_123',
                    items: [{ productId: product._id, quantity: 1 }],
                    shippingAddress: { street: '123 St', city: 'City', state: 'ST', zipCode: '12345' }
                });

            expect(res.statusCode).toBe(400); // Or 500 depending on error handling but ideally 400
        });
    });

    describe('GET /api/orders/myorders', () => {
        it('should return user orders', async () => {
            await Order.create({
                user: userId,
                items: [{
                    product: product._id,
                    quantity: 1,
                    price: 10,
                    name: 'Test Product'
                }],
                totalAmount: 10,
                paymentIntentId: 'pi_list_1',
                shippingAddress: {
                    street: '123 St',
                    city: 'City',
                    state: 'ST',
                    zipCode: '12345'
                }
            });

            const res = await request(app)
                .get('/api/orders/myorders')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
});
