const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

describe('Order Details Route', () => {
    let token;
    let userId;
    let orderId;
    let productId;

    beforeAll(async () => {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        // Clean up
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Create User
        const user = await User.create({
            name: 'Test User',
            email: 'testlist@example.com',
            password: 'password123',
            mobile: '1234567890'
        });
        userId = user._id;
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create Product
        const product = await Product.create({
            name: 'Test Product',
            description: 'Desc',
            price: 100,
            category: 'electronics',
            stock: 10,
            imageUrl: 'http://example.com/image.jpg',
            averageRating: 5
        });
        productId = product._id;

        // Create Order direct to DB to ensure we control the data
        const order = await Order.create({
            user: userId,
            items: [{
                product: productId,
                name: 'Test Product',
                price: 100,
                quantity: 1
            }],
            totalAmount: 100,
            shippingAddress: {
                street: '123 Main St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'USA'
            },
            paymentIntentId: 'pi_test_123',
            statusHistory: [{
                status: 'processing',
                date: new Date(),
                comment: 'Initial'
            }],
            trackingInfo: {
                carrier: 'DHL',
                trackingNumber: '123456789',
                trackingUrl: 'http://dhl.com'
            }
        });
        orderId = order._id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await mongoose.connection.close();
    });

    it('GET /api/orders/:id returns order details with status history and tracking', async () => {
        const start = Date.now();
        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);
        const end = Date.now();

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toEqual(orderId.toString());
        expect(res.body.data.statusHistory).toBeDefined();
        expect(Array.isArray(res.body.data.statusHistory)).toBe(true);
        expect(res.body.data.statusHistory[0].status).toEqual('processing');
        expect(res.body.data.trackingInfo).toBeDefined();
        expect(res.body.data.trackingInfo.carrier).toEqual('DHL');

        console.log(`Response time: ${end - start}ms`);
        // Note: Response time might vary in test environment, but aiming for low latency
    });

    it('GET /api/orders/:id returns 403 for wrong user', async () => {
        // Create another user
        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@example.com',
            password: 'password123',
            mobile: '1234567890'
        });
        const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET);

        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('GET /api/orders/:id returns 404 for non-existent order', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/orders/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
    });
});
